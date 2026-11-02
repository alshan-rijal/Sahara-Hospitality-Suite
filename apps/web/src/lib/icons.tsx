import {
  LayoutDashboard, Building2, Users, ShieldCheck, Contact, BedDouble, CalendarCheck,
  Sparkles, UtensilsCrossed, Receipt, Package, ShoppingCart, Wrench, BadgeCheck,
  PartyPopper, Shield, ScrollText, Home, LogOut, Gauge, PlaneLanding, Wallet,
  PackageX, Info, type LucideIcon
} from 'lucide-react';

/** Named icon set so menus, cards and headings share one consistent mark per concept. */
export const icons = {
  dashboard: LayoutDashboard,
  properties: Building2,
  users: Users,
  roles: ShieldCheck,
  guests: Contact,
  rooms: BedDouble,
  reservations: CalendarCheck,
  housekeeping: Sparkles,
  pos: UtensilsCrossed,
  folios: Receipt,
  inventory: Package,
  procurement: ShoppingCart,
  maintenance: Wrench,
  employees: BadgeCheck,
  banquets: PartyPopper,
  security: Shield,
  audit: ScrollText,
  home: Home,
  logout: LogOut,
  occupancy: Gauge,
  arrivals: PlaneLanding,
  inHouse: Users,
  balance: Wallet,
  lowStock: PackageX,
  events: PartyPopper,
  info: Info
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;
