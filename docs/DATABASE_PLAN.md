# Database Plan — The Kings Hotel

> PostgreSQL schema design with Prisma ORM. Implemented in Phase 3 at `prisma/schema.prisma`.

---

## Phase 3 Implementation Status

The schema is **implemented** (21 models) with a baseline migration generated at `prisma/migrations/0_init/migration.sql` (SQL output from `prisma migrate diff --from-empty`; apply against a live PostgreSQL instance when provisioning). Prisma Client is generated and shared via the `src/lib/prisma.ts` singleton.

### Implemented models

Identity & access: `Role`, `User`, `Staff`
Rooms & inventory: `RoomType`, `Room`
Bookings & payments: `Booking`, `Payment`, `Coupon`
Restaurant: `RestaurantCategory`, `RestaurantItem`, `RestaurantOrder`, `OrderItem`
Reservations: `TableReservation`, `PoolReservation`, `EventReservation`
Content & feedback: `Amenity`, `Review`, `GalleryImage`
Operations: `Notification`, `AuditLog`

Enums: `UserRole`, `RoomStatus`, `BookingStatus`, `BookingSource`, `PaymentStatus`, `PaymentProvider`, `ReservationStatus`, `OrderStatus`, `OrderType`, `NotificationType`, `ReviewStatus`, `AmenityCategory`, `DiscountType`, `EventType`, `StaffDepartment`, `EmploymentStatus`.

### Deviations from the draft below

- **No `AvailabilityCalendar`**: availability is computed dynamically with date-overlap queries against `Booking` (see `roomRepository.findAvailable` TODO). Re-introduce a materialized calendar only if read latency requires it.
- **No `ServiceCatalog` / `ServiceRequest`**: folded into a future phase; not part of the Phase 3 schema.
- **No separate `IdempotencyKey` table**: idempotency is a `@unique` nullable column on `Booking` (`idempotencyKey`).
- **`Room` is split** into `RoomType` (rate, capacity, features, images, slug) and `Room` (physical units: room number, floor, status) so a rate/type maps to many bookable units.
- **`User.role` is now `roleId`** referencing a normalized `Role` table (role name + permissions list) instead of a scalar enum.
- **`Payment` dropped `idempotencyKey`** (dedup lives on `Booking`) and added `metadata Json?` plus a unique `providerReference`.

### Conventions

- Money stored as integer minor units (`Int`) with a `currency` column (default `NGN`).
- UUID primary keys via `@default(uuid())`; scalar foreign keys named `<model>Id`.
- Cascade/restrict choices: audit/history relations use `Restrict`; owned content (`OrderItem`, `Payment`, `Review`, `Notification`) uses `Cascade` or `SetNull` as appropriate.
- `@updatedAt` on mutable models; `@db.Date` for stay dates and `@db.Timestamptz(3)` for time slots.

---

## Principles

1. **ACID compliance**: Booking accuracy is non-negotiable
2. **Type safety**: Prisma schema generates TypeScript types
3. **Migration-driven**: All schema changes via Prisma migrations
4. **Indexed for query patterns**: Indexes on foreign keys, date ranges, and status fields
5. **Extensible**: Schema accommodates future phases without breaking changes

---

## Entity Relationship Diagram (Conceptual)

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│   Room   │1───*│ Booking  │*───1│   User   │
└──────────┘     └──────────┘     └──────────┘
                     │
                     │ 1
                     │
                     ▼
                 ┌──────────┐
                 │ Payment  │
                 └──────────┘

┌──────────┐     ┌──────────┐
│  Service │1───*│  Request │*───1│ Booking
│  Catalog │     └──────────┘     └──────────
└──────────┘

┌──────────────────┐
│ Availability     │
│ Calendar         │───1 Room
│ (date × room_id) │
└──────────────────┘

┌──────────┐
│  Review  │───1 Room
│          │───1 User
└──────────┘
```

---

## Tables

### `Room`

Stores room configurations, pricing, and features.

```prisma
model Room {
  id          String   @id @default(uuid())
  slug        String   @unique
  title       String
  description String
  longDescription String
  price       Int      // Stored in kobo/cent for precision
  currency    String   @default("NGN")
  capacity    Int      // Max guests
  bed         String
  size        String?  // e.g., "35 m²"
  features    String[] // Array of feature names
  images      String[] // Array of Cloudinary URLs
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  bookings          Booking[]
  availability      AvailabilityCalendar[]
  reviews           Review[]
  serviceRequests   ServiceRequest[]
}
```

**Indexes**:
- `slug` (unique) — URL lookups
- `capacity` — Capacity-based filtering
- `price` — Price sorting

---

### `User`

Guest and staff accounts.

```prisma
model User {
  id             String   @id @default(uuid())
  name           String
  email          String   @unique
  phone          String?
  passwordHash   String
  role           UserRole @default(GUEST)
  emailVerified  Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  bookings Booking[]
  reviews  Review[]
}

enum UserRole {
  GUEST
  STAFF
  ADMIN
}
```

**Indexes**:
- `email` (unique) — Login lookups
- `role` — Admin queries

---

### `Booking`

The core transactional table. Every booking creates one row.

```prisma
model Booking {
  id               String        @id @default(uuid())
  roomId           String
  userId           String
  checkIn          DateTime      @db(Date)
  checkOut         DateTime      @db(Date)
  guests           Int
  status           BookingStatus @default(PENDING)
  totalAmount      Int           // Price × nights in kobo
  currency         String        @default("NGN")
  specialRequests  String?
  idempotencyKey   String?       @unique
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  cancelledAt      DateTime?

  room             Room          @relation(fields: [roomId], references: [id])
  user             User          @relation(fields: [userId], references: [id])
  payment          Payment?
  serviceRequests  ServiceRequest[]
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
  NO_SHOW
}
```

**Indexes**:
- `(roomId, checkIn, checkOut)` — Availability queries (composite)
- `userId` — User's booking history
- `status` — Status filtering
- `checkIn` — Date-range queries
- `idempotencyKey` (unique) — Deduplication

**Partitioning** (future): Range partition by `checkIn` (monthly).

---

### `Payment`

Tracks payment transactions against bookings.

```prisma
model Payment {
  id            String         @id @default(uuid())
  bookingId     String         @unique
  amount        Int            // In kobo
  currency      String         @default("NGN")
  status        PaymentStatus  @default(PENDING)
  provider      String?        // "paystack", "flutterwave"
  providerRef   String?        // Reference from payment gateway
  idempotencyKey String?        @unique
  paidAt        DateTime?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  booking       Booking        @relation(fields: [bookingId], references: [id])
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
  REFUNDED
}
```

**Indexes**:
- `bookingId` (unique) — One-to-one with booking
- `status` — Reconciliation queries
- `providerRef` — Payment gateway lookup

---

### `AvailabilityCalendar`

Pre-computed daily availability per room. Enables fast O(1) availability lookups without complex SQL date-overlap queries.

```prisma
model AvailabilityCalendar {
  id       String   @id @default(uuid())
  roomId   String
  date     DateTime @db(Date)
  booked   Boolean  @default(false)

  room     Room     @relation(fields: [roomId], references: [id])

  @@unique([roomId, date]) // One row per room per day
  @@index([date])          // Date-range queries
}
```

**Population**: A scheduled job runs daily to populate next 365 days. When a booking is confirmed, the `booked` flag is set to `true` for the date range.

**Alternative**: Compute availability dynamically via SQL exclusion join on `Booking`. The `AvailabilityCalendar` table is an optimization for read-heavy workloads.

---

### `ServiceCatalog`

Defines available hotel services (room service items, laundry options, etc.).

```prisma
model ServiceCatalog {
  id          String   @id @default(uuid())
  category    ServiceCategory
  name        String
  description String?
  price       Int?     // Optional: some services may have a fee
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
}

enum ServiceCategory {
  ROOM_SERVICE
  LAUNDRY
  HOUSEKEEPING
  CONCIERGE
  SPA
  RECREATION
}
```

---

### `ServiceRequest`

A guest's service request during their stay.

```prisma
model ServiceRequest {
  id          String          @id @default(uuid())
  bookingId   String
  serviceId   String
  notes       String?
  status      RequestStatus   @default(PENDING)
  assignedTo  String?         // Staff member ID
  completedAt DateTime?
  createdAt   DateTime        @default(now())

  booking     Booking         @relation(fields: [bookingId], references: [id])
  service     ServiceCatalog  @relation(fields: [serviceId], references: [id])
}

enum RequestStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

**Indexes**:
- `bookingId` — All services for a booking
- `status` — Staff view of pending requests

---

### `Review`

Guest reviews for rooms.

```prisma
model Review {
  id        String   @id @default(uuid())
  roomId    String
  userId    String
  rating    Int      // 1–5
  title     String?
  comment   String?
  createdAt DateTime @default(now())

  room      Room     @relation(fields: [roomId], references: [id])
  user      User     @relation(fields: [userId], references: [id])

  @@unique([roomId, userId]) // One review per user per room
}
```

**Indexes**:
- `roomId` — Room review list
- `(roomId, rating)` — Aggregate rating queries

---

### `IdempotencyKey`

Stores processed idempotency keys for safe retries.

```prisma
model IdempotencyKey {
  id        String   @id
  response  Json     // Cached response
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([expiresAt]) // TTL cleanup
}
```

**Cleanup**: Cron job deletes rows where `expiresAt < NOW()` (24-hour TTL).

---

## Query Patterns

### Find available rooms for date range

```sql
-- Using AvailabilityCalendar (O(1) per room per day)
SELECT DISTINCT r.*
FROM "Room" r
WHERE NOT EXISTS (
  SELECT 1 FROM "AvailabilityCalendar" ac
  WHERE ac.room_id = r.id
    AND ac.date BETWEEN '2026-09-01' AND '2026-09-03'
    AND ac.booked = true
);

-- Dynamic: using Booking table exclusion join
SELECT r.*
FROM "Room" r
WHERE r.id NOT IN (
  SELECT b.room_id
  FROM "Booking" b
  WHERE b.status IN ('PENDING', 'CONFIRMED')
    AND b.check_in < '2026-09-03'  -- Existing booking ends after check-in
    AND b.check_out > '2026-09-01' -- Existing booking starts before check-out
);
```

### Prevent double-booking (transactional)

```sql
BEGIN;
-- Acquire advisory lock or row-level lock
SELECT pg_advisory_xact_lock(
  ('x' || substr(md5(room_id || check_in::text), 1, 16))::bit(64)::bigint
);

-- Check availability
SELECT 1 FROM "Booking"
WHERE room_id = $1
  AND status IN ('PENDING', 'CONFIRMED')
  AND check_in < $3  -- $3 = check_out
  AND check_out > $2 -- $2 = check_in;

-- If no conflicting booking:
INSERT INTO "Booking" (...) VALUES (...);
COMMIT;
```

---

## Migration Strategy

| Step | Action |
|------|--------|
| 1 | Define Prisma schema (all tables above) |
| 2 | Run `prisma migrate dev --name init` |
| 3 | Create seed script for rooms + services |
| 4 | Run `prisma db seed` |
| 5 | Verify with `prisma studio` |

**Subsequent migrations**: Each phase adds tables or columns via `prisma migrate dev`.

---

## Seed Data

Rooms will be seeded from the existing `src/lib/data/rooms.ts` content. Services seeded from `src/lib/data/services.ts`. Initial admin user created with known credentials.

---

## Future Considerations

### Partitioning
When `Booking` exceeds 10M rows, partition by `checkIn` month using PostgreSQL declarative partitioning:
```sql
CREATE TABLE "Booking" (
  ...
) PARTITION BY RANGE (check_in);

CREATE TABLE "Booking_2026_09" PARTITION OF "Booking"
  FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
```

### Sharding
If the platform expands to multiple hotels, shard by `hotel_id`. Each hotel's data lives on a separate PostgreSQL instance. Application routes queries based on tenant context.

### Read Replicas
Add read replicas for query-heavy endpoints (room listings, reviews). Prisma supports read replica routing:
```typescript
const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL_PRIMARY },
  },
}).$extends(withReplicas({
  read: [new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL_REPLICA } } })]
}));
```

### pgvector Extension
For Phase 10 (AI Concierge), enable `pgvector`:
```sql
CREATE EXTENSION vector;
ALTER TABLE "Room" ADD COLUMN embedding vector(384);
```
This enables semantic search queries directly in PostgreSQL without a separate vector database.

---

*This plan will evolve. Each phase should adjust the schema as new requirements emerge.*
