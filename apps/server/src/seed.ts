import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDatabase } from './config/db.js';
import { PERMISSIONS, type Permission, type Scope } from './constants/permissions.js';
import { Role } from './models/Role.js';
import { Property } from './models/Property.js';
import { User } from './models/User.js';

const p = (...prefixes: string[]) => PERMISSIONS.filter(permission => prefixes.some(prefix => permission === prefix || permission.startsWith(`${prefix}.`))) as Permission[];
const combine = (...sets: Permission[][]) => [...new Set(sets.flat())] as Permission[];

interface RoleSeed { name:string; code:string; level:1|2|3; scope:Scope; permissions:Permission[]; department?:string; description:string; }
const roles: RoleSeed[] = [
  {name:'Corporate Administrator',code:'corporate_admin',level:1,scope:'corporate',permissions:[...PERMISSIONS],description:'Full group-wide ERP administration.'},
  {name:'Group Owner',code:'group_owner',level:1,scope:'corporate',permissions:combine(p('dashboard','properties','guests','rooms','reservations','folios','inventory','procurement','maintenance','employees','banquets','security','reports','audit')),description:'Executive visibility across all properties.'},
  {name:'Corporate Finance Director',code:'corporate_finance',level:1,scope:'corporate',permissions:combine(p('dashboard','properties.read','folios','procurement','inventory.read','employees.payroll','reports','audit')),description:'Consolidated finance and controls.'},
  {name:'Regional Manager',code:'regional_manager',level:1,scope:'property',permissions:combine(p('dashboard','properties.read','users.read','guests','rooms','reservations','housekeeping','pos.read','folios','inventory','procurement','maintenance','employees.read','banquets','security.read','reports','audit')),description:'Oversight of assigned properties.'},
  {name:'General Manager',code:'general_manager',level:2,scope:'property',permissions:combine(p('dashboard','properties.read','users.read','users.manage','roles.read','guests','rooms','reservations','housekeeping','pos','folios','inventory','procurement','maintenance','employees','banquets','security','reports','audit')),description:'Complete operational control of one property.'},
  {name:'Front Office Manager',code:'front_office_manager',level:2,scope:'property',permissions:combine(p('dashboard','guests','rooms.read','rooms.status','reservations','folios.read','folios.manage','folios.settle','reports.read')),department:'front_office',description:'Reservations, reception and guest folios.'},
  {name:'Housekeeping Manager',code:'housekeeping_manager',level:2,scope:'department',permissions:combine(p('dashboard','rooms.read','rooms.status','housekeeping','inventory.read','maintenance.read','maintenance.manage','reports.read')),department:'housekeeping',description:'Housekeeping assignments and room inspection.'},
  {name:'Food & Beverage Manager',code:'fnb_manager',level:2,scope:'department',permissions:combine(p('dashboard','pos','folios.read','inventory','procurement.read','procurement.manage','reports.read')),department:'food_beverage',description:'Restaurant, room service and outlet control.'},
  {name:'Finance Manager',code:'finance_manager',level:2,scope:'property',permissions:combine(p('dashboard','folios','inventory.read','procurement','employees.payroll','reports','audit')),department:'finance',description:'Property finance, settlement and approvals.'},
  {name:'Purchase Manager',code:'purchase_manager',level:2,scope:'property',permissions:combine(p('dashboard','inventory','procurement','reports.read','audit.read')),department:'procurement',description:'Purchasing and supplier workflow.'},
  {name:'Engineering Manager',code:'engineering_manager',level:2,scope:'department',permissions:combine(p('dashboard','rooms.read','rooms.status','maintenance','inventory.read','procurement.read','procurement.manage','reports.read')),department:'engineering',description:'Assets and engineering operations.'},
  {name:'HR Manager',code:'hr_manager',level:2,scope:'property',permissions:combine(p('dashboard','users.read','employees','reports.read','audit.read')),department:'hr',description:'Employee administration and payroll access.'},
  {name:'Sales & Banquet Manager',code:'sales_manager',level:2,scope:'property',permissions:combine(p('dashboard','guests.read','reservations.read','banquets','folios.read','reports.read')),department:'sales',description:'Sales leads, groups and banquet events.'},
  {name:'Security Manager',code:'security_manager',level:2,scope:'department',permissions:combine(p('dashboard','guests.read','rooms.read','security','reports.read','audit.read')),department:'security',description:'Security incidents and investigations.'},
  {name:'Receptionist',code:'receptionist',level:3,scope:'property',permissions:combine(p('dashboard','guests','rooms.read','reservations.read','reservations.manage','reservations.checkin','reservations.checkout','reservations.cancel','folios.read','folios.manage','folios.settle')),department:'front_office',description:'Day-to-day reservation and front desk operations.'},
  {name:'Night Auditor',code:'night_auditor',level:3,scope:'property',permissions:combine(p('dashboard','guests.read','rooms.read','reservations.read','reservations.checkout','folios','reports.read','audit.read')),department:'front_office',description:'Night closure and revenue reconciliation.'},
  {name:'Room Attendant',code:'room_attendant',level:3,scope:'department',permissions:combine(p('dashboard','rooms.read','housekeeping.read','housekeeping.manage','maintenance.read','maintenance.manage')),department:'housekeeping',description:'Assigned room cleaning and issue reporting.'},
  {name:'Waiter / POS Operator',code:'waiter',level:3,scope:'department',permissions:combine(p('dashboard','pos.read','pos.manage','folios.read')),department:'food_beverage',description:'Outlet POS and room charge posting.'},
  {name:'Storekeeper',code:'storekeeper',level:3,scope:'department',permissions:combine(p('dashboard','inventory.read','inventory.manage','inventory.adjust','procurement.read','procurement.manage')),department:'stores',description:'Store stock and material transactions.'},
  {name:'Maintenance Technician',code:'technician',level:3,scope:'department',permissions:combine(p('dashboard','rooms.read','maintenance.read','maintenance.manage','maintenance.close','inventory.read')),department:'engineering',description:'Assigned maintenance work orders.'}
];

/**
 * Seeds the access model only: properties, roles and one account per role.
 * No guests, rooms, reservations, folios or other operational records — the app
 * starts with empty modules so real data can be entered through the UI.
 */
async function seed() {
  await connectDatabase();
  await mongoose.connection.dropDatabase();
  const [dehradun, mussoorie] = await Property.create([
    {name:'Sahara Dehradun',code:'GSDDN',type:'hotel',timezone:'Asia/Kolkata',currency:'GBP',address:'Rajpur Road, Dehradun',email:'dehradun@sahara.test'},
    {name:'Sahara Mussoorie Resort',code:'GSMSR',type:'resort',timezone:'Asia/Kolkata',currency:'GBP',address:'Library Road, Mussoorie',email:'mussoorie@sahara.test'}
  ]);

  const roleDocs = await Role.insertMany(roles.map(({department,...role}) => ({...role,isSystem:true})));
  const roleByCode = Object.fromEntries(roleDocs.map(role => [role.code, role]));
  const passwordHash = await bcrypt.hash('Hotel@123', 12);
  for (const role of roles) {
    await User.create({
      name: role.name,
      email: `${role.code}@sahara.test`,
      passwordHash,
      roleId: roleByCode[role.code]._id,
      propertyIds: role.scope === 'corporate' ? [dehradun._id,mussoorie._id] : [dehradun._id],
      departmentIds: role.department ? [role.department] : [],
      active:true
    });
  }

  console.log(`\nSahara Hospitality Suite seeded: 2 properties, ${roles.length} roles, ${roles.length} accounts, no operational data.`);
  console.log('Login: corporate_admin@sahara.test');
  console.log('Password: Hotel@123');
  console.log('Every seeded role uses the same password and a <role_code>@sahara.test email.\n');
  await mongoose.disconnect();
}
seed().catch(async error=>{console.error(error);await mongoose.disconnect();process.exit(1);});
