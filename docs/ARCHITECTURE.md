# Architecture

## Repository layout

```text
hotel-erp-mern/
├── apps/
│   ├── server/                 Express and MongoDB API
│   │   └── src/
│   │       ├── config/         Environment and database
│   │       ├── constants/      Permission catalogue
│   │       ├── middleware/     Authentication, validation, errors
│   │       ├── models/         Mongoose domain models
│   │       ├── routes/         CRUD and workflow endpoints
│   │       ├── services/       Scope and audit services
│   │       └── seed.ts         Roles and demo records
│   └── web/                    React ERP dashboard
│       └── src/
│           ├── components/     Layout, forms and action modals
│           ├── context/        Authentication state
│           ├── lib/            API client and module metadata
│           └── pages/          Login, dashboard and modules
├── docs/
├── docker-compose.yml
└── package.json                npm workspaces
```

## Request path

```text
React screen
   ↓
Axios with JWT
   ↓
Express route
   ↓
authenticate middleware
   ↓
authorize(permission)
   ↓
property/department scope filter
   ↓
Zod validation
   ↓
Mongoose domain operation
   ↓
audit log
   ↓
JSON response
```

## Domain boundaries

- **Identity and access:** User, Role, Property
- **Guest operations:** Guest, Room, Reservation, Folio
- **Service operations:** HousekeepingTask, PosOrder, WorkOrder
- **Back office:** InventoryItem, PurchaseRequisition, Employee
- **Commercial and safety:** BanquetEvent, Incident
- **Governance:** AuditLog

## Scaling path

The current implementation is a modular monolith suitable for local development and an early production pilot. It can be split gradually without replacing the frontend:

1. Put an API gateway in front of the API.
2. Extract identity/RBAC.
3. Extract reservations and room inventory.
4. Extract POS and folio services with transactional messaging.
5. Extract inventory/procurement.
6. Publish domain events through Kafka or RabbitMQ.
7. Move reporting to a warehouse/read model.

Recommended events include `reservation.confirmed`, `guest.checked_in`, `pos.posted_to_room`, `folio.settled`, `guest.checked_out`, `room.cleaned`, `room.inspected`, `purchase.approved`, and `work_order.closed`.
