# Role-Based Access Control

## Three levels

| Level | Typical roles | Data boundary |
|---|---|---|
| 1 | Corporate administrator, owner, corporate finance, regional manager | Group or assigned properties |
| 2 | General manager and department managers | Assigned property/properties |
| 3 | Receptionist, room attendant, waiter, storekeeper, technician | Assigned property and often assigned department |

## Enforcement

A user can act only when all required checks pass:

```text
authenticated user
AND active account
AND required permission
AND authorised property
AND authorised department when applicable
AND valid workflow state
```

Examples:

- A receptionist may have `reservations.checkin` but cannot check a guest into a room belonging to another property.
- A room attendant may update housekeeping tasks only inside the assigned housekeeping department.
- A finance manager may settle folios but a waiter cannot issue a refund.
- A purchase requester cannot approve unless their role includes `procurement.approve`.

## Permission catalogue

Permissions use `resource.action` naming. Examples:

```text
rooms.read
rooms.manage
rooms.status
reservations.read
reservations.manage
reservations.checkin
reservations.checkout
reservations.cancel
folios.settle
folios.refund
housekeeping.inspect
procurement.approve
maintenance.close
employees.payroll
audit.read
```

The complete catalogue is in `apps/server/src/constants/permissions.ts`.

## Data scopes

### Corporate

No automatic property filter. The role can still have limited permissions.

### Property

Queries are automatically constrained to the user’s `propertyIds`.

### Department

Queries are constrained to `propertyIds` and, for department-aware models, `departmentIds`.

### Self

The scope service supports owner fields for future employee self-service features.

## Security rule

The frontend never grants access. It only renders navigation and controls based on the user’s permission list. The API repeats every access check independently.
