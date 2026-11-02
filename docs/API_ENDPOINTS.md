# API Endpoints

Base URL: `/api`

## Public

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Service health |
| POST | `/auth/login` | Authenticate and receive JWT |

## Identity and administration

| Method | Endpoint | Permission |
|---|---|---|
| GET | `/auth/me` | Authenticated |
| GET/POST/PUT | `/admin/roles` | `roles.read` / `roles.manage` |
| GET/POST/PUT | `/admin/users` | `users.read` / `users.manage` |
| GET | `/admin/permissions` | `roles.read` |
| GET | `/admin/properties/options` | `properties.read` |

## Standard resources

The following resources support list, read, create, update and delete according to their read/manage permissions:

```text
/properties
/guests
/rooms
/reservations
/housekeeping
/maintenance
/inventory
/procurement
/employees
/banquets
/incidents
/pos-orders
/folios
```

Standard routes:

| Method | Pattern |
|---|---|
| GET | `/<resource>` |
| POST | `/<resource>` |
| GET | `/<resource>/:id` |
| PUT | `/<resource>/:id` |
| DELETE | `/<resource>/:id` |

## Reservation workflow

| Method | Endpoint | Permission |
|---|---|---|
| POST | `/reservations/:id/check-in` | `reservations.checkin` |
| POST | `/reservations/:id/check-out` | `reservations.checkout` |
| POST | `/reservations/:id/cancel` | `reservations.cancel` |

## Room and housekeeping workflow

| Method | Endpoint | Permission |
|---|---|---|
| POST | `/rooms/:id/status` | `rooms.status` |
| POST | `/housekeeping/:id/start` | `housekeeping.manage` |
| POST | `/housekeeping/:id/complete` | `housekeeping.manage` |
| POST | `/housekeeping/:id/inspect` | `housekeeping.inspect` |

## Folio and POS workflow

| Method | Endpoint | Permission |
|---|---|---|
| POST | `/folios/:id/charge` | `folios.manage` |
| POST | `/folios/:id/settle` | `folios.settle` |
| POST | `/folios/:id/refund` | `folios.refund` |
| POST | `/pos-orders/:id/post-to-room` | `pos.manage` |

## Back-office workflow

| Method | Endpoint | Permission |
|---|---|---|
| POST | `/procurement/:id/approve` | `procurement.approve` |
| POST | `/maintenance/:id/status` | `maintenance.manage` |
| POST | `/incidents/:id/resolve` | `security.manage` |

## Reporting and governance

| Method | Endpoint | Permission |
|---|---|---|
| GET | `/dashboard` | `dashboard.read` |
| GET | `/audit-logs` | `audit.read` |
