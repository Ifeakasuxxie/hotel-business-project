# Production Architecture & Implementation Plan

> The Kings Hotel — Full-Stack Hospitality Platform

---

## Overview

This document serves as both a production implementation roadmap and a system design learning roadmap. Each phase maps real hotel-platform features to fundamental software engineering concepts, explaining **why** each concept matters, **how** this project implements it, **when** it becomes relevant, and what **trade-offs** are involved.

---

## Phase 1: Foundation & Project Scaffolding

### Goal
Establish the frontend architecture, design system, toolchain, and deployment pipeline before any business logic is written.

### Build Tasks
- Initialize Next.js 14.2.5 with App Router
- Configure TypeScript, Tailwind CSS, `shadcn/ui`
- Set up font system (Inter + Playfair Display)
- Create design tokens (`globals.css`, `tailwind.config.ts`)
- Build reusable UI primitives (Button, Card, Badge, Input, etc.)
- Configure `next.config.mjs` (image remote patterns, strict mode)
- Set up project folder structure (`/components`, `/lib`, `/app`)

### System Design Concepts

#### Scalability
- **Why**: A component library (Button, Card, Badge) ensures every page reuses the same primitives. This eliminates duplication, reduces bundle size, and makes future pages faster to build — directly improving developer scalability.
- **How**: All UI components live in `/components/ui/` and accept consistent props. Adding a new page requires zero new component styling.
- **When**: Relevant from day one. Every page built in Phase 2 reuses these primitives.
- **Trade-off**: Abstraction overhead. A simple project might hardcode styles; our approach trades initial setup time for long-term maintainability.

#### Vertical Scaling
- **Why**: The project currently runs on a single Next.js server (localhost:3000). Vertical scaling means adding more power (CPU, RAM) to that one machine. For a static marketing site with minimal server load, vertical scaling is sufficient.
- **How**: During development, all rendering happens on one Node.js process. In production, Vercel handles serverless function scaling automatically.
- **When**: Sufficient for Phases 1–2. Horizontal scaling (multiple machines) becomes relevant in Phase 9.
- **Trade-off**: Vertical scaling has a hard ceiling (max machine specs). Horizontal scaling is more complex but theoretically unbounded.

#### Latency
- **Why**: Latency is the time between a user action and the response. Even without a database, latency matters: slow font loading, unoptimized images, and large JavaScript bundles delay First Contentful Paint (FCP).
- **How**: We use `next/font` for self-hosted font subsets, `next/image` for responsive images, and static generation (SSG) to pre-render pages at build time — reducing latency to zero on the critical path for most pages.
- **When**: Latency optimization begins in Phase 1 and continues through every phase (CDN in Phase 2, caching in Phase 6, database query optimization in Phase 3).
- **Trade-off**: SSG trade-off: pages cannot display user-specific real-time data without client-side fetching.

#### Throughput
- **Why**: Throughput measures requests handled per second. For a hotel website handling hundreds of concurrent visitors browsing rooms, throughput matters more than latency for overall capacity.
- **How**: Static generation produces HTML files served directly by CDN edge nodes, dramatically increasing throughput versus server-rendered pages.
- **When**: Throughput becomes critical in Phase 4 (booking engine) when concurrent booking requests must be processed without race conditions.
- **Trade-off**: Throughput optimizations (caching, CDN) can serve stale data. Booking requires real-time accuracy.

#### DNS
- **Why**: DNS translates a human-readable domain (e.g., `thekingshotel.ng`) into a server IP address. Without DNS, users must remember IP addresses.
- **How**: The domain will be configured with a CNAME record pointing to `cname.vercel-dns.com`. Vercel provisions an SSL/TLS certificate automatically via Let's Encrypt.
- **When**: Configured just before production launch. Not relevant in local development (localhost resolves via `/etc/hosts`).
- **Trade-off**: DNS propagation takes 24–48 hours. TTL (Time To Live) settings balance update speed against query load.

### Future Expansion
- Move from a single Next.js server to a microservices architecture
- Split frontend (Next.js) from backend (Node.js/FastAPI)
- Add DNS-level load balancing and failover

### Deliverables
- ✅ Next.js 14.2.5 project initialized
- ✅ Design system with cream/navy/gold tokens
- ✅ Reusable UI primitives in `/components/ui/`
- ✅ Font system configured
- ✅ Project folder structure established

### Verification
- `npm run build` succeeds
- Homepage renders with correct fonts and styles
- All UI primitives display correctly in Storybook or in-page

---

## Phase 2: Public Website & UI

### Goal
Build the complete public-facing marketing website with static and client-rendered pages, image optimization, and responsive design.

### Build Tasks
- Build Navbar with scroll-aware transparency and mobile drawer
- Build Footer with 4-column layout
- Create homepage sections (Hero, Booking Search, About, Featured Rooms, Services, Experience, Gallery, Testimonials, Location, CTA)
- Create sub-pages (/rooms, /rooms/[id], /about, /services, /experience, /testimonials, /contact, /book)
- Implement booking flow with date selection, room quantity, and live pricing
- Configure images (Unsplash remote patterns, local hero/room images)

### System Design Concepts

#### CDN (Content Delivery Network)
- **Why**: A CDN caches static assets (HTML, CSS, JS, images) at edge servers worldwide, reducing latency for users far from the origin server. Without a CDN, a user in Lagos requesting an image from a US-based server experiences high latency.
- **How**: Vercel's Edge Network acts as a built-in CDN. Static pages (all Phase 2 pages) are pre-rendered and served from 100+ edge locations. Image optimization via `next/image` leverages Vercel's CDN automatically.
- **When**: Active from deployment. Every static page and optimized image benefits immediately.
- **Trade-off**: Cache invalidation. When content changes, CDN edges must purge old caches. Vercel handles this on deploy, but custom CDN setups require manual purge strategies.

#### Reverse Proxy
- **Why**: A reverse proxy sits in front of web servers, handling SSL termination, request routing, load balancing, and caching. Users never connect directly to the application server.
- **How**: Vercel's platform acts as a reverse proxy. Incoming requests hit Vercel's edge, which terminates SSL, checks the CDN cache, and routes to the appropriate serverless function or static file.
- **When**: Active for every request in production. During development, Next.js's built-in server handles routing without a reverse proxy.
- **Trade-off**: Adds a hop (edge → server), but the latency benefit of edge caching far outweighs this for most requests.

#### API Gateway (Conceptual)
- **Why**: An API Gateway is a single entry point that routes requests to appropriate backend services, handles authentication, rate limiting, and request transformation. For the hotel platform, it would sit between the frontend and backend services.
- **How**: Currently conceptual — the Next.js App Router acts as a lightweight BFF (Backend For Frontend). In Phase 4, a dedicated API Gateway (e.g., Kong, AWS API Gateway) would route `/api/bookings`, `/api/payments`, `/api/auth` to separate microservices.
- **When**: Becomes concrete in Phase 4 when backend APIs are introduced.
- **Trade-off**: Adds network latency and operational complexity. Small projects may use a monolithic API without a gateway.

#### Object Storage
- **Why**: Storing images in `/public` works during development but doesn't scale. Images should live in dedicated object storage (Cloudinary, AWS S3, GCS) for CDN delivery, on-the-fly transformations, and separation from application code.
- **How**: Currently, images come from Unsplash (via URL) and local `/public/images/` files. Future migration: upload hotel photos to Cloudinary, use its transformation API for thumbnails, and serve via Cloudinary's built-in CDN.
- **When**: Migrate in Phase 3 (new images) or Phase 7 (user-generated content). The Unsplash remote pattern in `next.config.mjs` is already configured.
- **Trade-off**: External storage adds dependency and cost. Local storage is simpler but lacks CDN delivery, transformation, and scaling.

#### Rate Limiting
- **Why**: Public-facing forms (booking, contact) are vulnerable to abuse — bots can submit thousands of requests, overwhelming the system or creating fake bookings. Rate limiting restricts requests per IP or user within a time window.
- **How**: Currently not implemented. Future implementation: Vercel Edge Middleware can rate-limit by IP using an in-memory counter or external store (Upstash Redis). Contact form submissions limited to 5/min per IP; booking submissions to 3/min per IP.
- **When**: Implement in Phase 4 (booking engine) alongside the backend API.
- **Trade-off**: Overly aggressive rate limiting can block legitimate users. Must balance security with UX (e.g., exponential backoff instead of hard blocks).

### Future Expansion
- Migrate images from `/public` + Unsplash to Cloudinary
- Add Vercel Analytics for real-user monitoring
- Implement A/B testing on booking CTA placement

### Deliverables
- ✅ 18 static routes (homepage + sub-pages)
- ✅ Book page with multi-room selection and live pricing
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Image optimization via `next/image`

### Verification
- `npm run build` succeeds with all routes
- All pages render without hydration errors
- Booking form calculates prices correctly
- Mobile menu opens/closes on all viewports

---

## Phase 3: Database & ORM

### Goal
Introduce persistent storage with PostgreSQL, Prisma ORM, and database design for rooms, bookings, users, and availability.

### System Design Concepts

#### Database
- **Why**: A database provides structured, queryable, durable storage. For the hotel platform, we need to store rooms, bookings, guests, payments, and availability — data that must survive server restarts and be queried efficiently.
- **How**: PostgreSQL via Prisma ORM. Prisma provides type-safe queries, migrations, and a declarative schema. Tables: `Room`, `Booking`, `User`, `Payment`, `AvailabilityCalendar`.
- **When**: Introduced in Phase 3. All subsequent phases depend on it.
- **Trade-off**: Adding a database introduces latency (network I/O), operational overhead (migrations, backups), and a new failure mode (connection pool exhaustion).

#### SQL
- **Why**: SQL is the standard language for relational database queries. It enables complex joins (e.g., "find available rooms for check-in/check-out dates"), aggregations ("total revenue this month"), and transactional operations.
- **How**: Prisma generates SQL from declarative queries. Example: `prisma.room.findMany({ where: { bookings: { none: { ... } } } })` generates a SQL `LEFT JOIN` with `NULL` check to find available rooms.
- **When**: Every database operation in Phases 3–10 uses SQL (via Prisma).
- **Trade-off**: ORMs abstract SQL but can generate inefficient queries. Complex availability queries may require raw SQL for performance.

#### ACID
- **Why**: ACID (Atomicity, Consistency, Isolation, Durability) guarantees that database transactions are processed reliably. For bookings, ACID ensures that two users cannot book the same room for the same night.
- **How**: PostgreSQL is fully ACID-compliant. A booking transaction:
  1. **Atomic**: If creating the booking record succeeds but the payment record fails, the entire transaction rolls back.
  2. **Consistent**: The database enforces constraints (e.g., no overlapping bookings for the same room).
  3. **Isolated**: Concurrent booking attempts are serialized or use row-level locks.
  4. **Durable**: Once committed, the booking survives a server crash.
- **When**: Essential for every write operation in Phases 3–10.
- **Trade-off**: ACID guarantees come at a performance cost. PostgreSQL uses `SERIALIZABLE` isolation for booking, which reduces concurrency compared to `READ COMMITTED`.

#### Indexes
- **Why**: Indexes speed up query performance by creating ordered data structures (B-trees) on columns. Without indexes, finding a booking by email requires a full table scan — O(n) instead of O(log n).
- **How**: Index on `Booking.roomId` for room availability queries, `Booking.checkIn`/`checkOut` for date-range queries, `User.email` for login lookups. Prisma schema uses `@@index` or `@@unique` decorators.
- **When**: Added when query performance becomes measurable. Profile with `EXPLAIN ANALYZE` before adding indexes.
- **Trade-off**: Indexes slow down writes (INSERT/UPDATE/DELETE must update the index) and consume disk space. Only index columns used in `WHERE`, `JOIN`, and `ORDER BY`.

#### Data Partitioning
- **Why**: Partitioning splits large tables into smaller, more manageable pieces. For the hotel platform, the `Booking` table could grow to millions of rows. Partitioning by month or quarter improves query performance and maintenance.
- **How**: PostgreSQL supports table partitioning by range (e.g., `PARTITION BY RANGE (check_in)`). Each month's bookings live in a separate partition. Queries filtered by date only scan relevant partitions (partition pruning).
- **When**: Relevant when bookings exceed ~10M rows. Not needed in early phases.
- **Trade-off**: Increases schema complexity. Foreign keys referencing partitioned tables have limitations. Migration to partitioning requires downtime or careful online migration.

### Schema Overview (Conceptual)
```sql
CREATE TABLE "Room" (
  id          UUID PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  price       INTEGER NOT NULL,
  currency    TEXT DEFAULT 'NGN',
  capacity    INTEGER NOT NULL,
  bed         TEXT NOT NULL,
  size        TEXT,
  features    TEXT[],
  images      TEXT[]
);

CREATE TABLE "Booking" (
  id             UUID PRIMARY KEY,
  room_id        UUID NOT NULL REFERENCES "Room"(id),
  user_id        UUID NOT NULL REFERENCES "User"(id),
  check_in       DATE NOT NULL,
  check_out      DATE NOT NULL,
  guests         INTEGER NOT NULL,
  status         TEXT DEFAULT 'pending',
  total_amount   INTEGER NOT NULL,
  special_requests TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "User" (
  id       UUID PRIMARY KEY,
  name     TEXT NOT NULL,
  email    TEXT UNIQUE NOT NULL,
  phone    TEXT,
  password TEXT
);

CREATE TABLE "Payment" (
  id             UUID PRIMARY KEY,
  booking_id     UUID NOT NULL REFERENCES "Booking"(id),
  amount         INTEGER NOT NULL,
  currency       TEXT DEFAULT 'NGN',
  status         TEXT DEFAULT 'pending',
  provider       TEXT,
  provider_ref   TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
```

### Verification
- Prisma migration runs successfully
- Seed script populates rooms and test data
- Availability queries return correct results
- Concurrent booking attempts prevent double-booking

### Deliverables (implemented)
- ✅ `prisma/schema.prisma` — 21 models + 16 enums (see `docs/DATABASE_PLAN.md`)
- ✅ `prisma/migrations/0_init/migration.sql` — baseline SQL via `prisma migrate diff --from-empty`
- ✅ `src/lib/prisma.ts` — PrismaClient singleton (dev hot-reload guard)
- ✅ `src/lib/errors/` — `ApiError` + `NotFound/Validation/Conflict/Unauthorized/Forbidden/NotImplemented/Database` subclasses
- ✅ `src/lib/types/` — `ApiResponse`, `Paginated<T>`, DTOs
- ✅ `src/lib/validations/` — Zod schemas for every resource (bookings, users, rooms, payments, reviews, restaurant, reservations, contact)
- ✅ `src/lib/repositories/` — typed CRUD per aggregate over `@prisma/client`
- ✅ `src/lib/services/` — business-logic placeholders throwing `NotImplementedError` with Phase-4 TODO notes
- ✅ `src/lib/middleware/` — `withErrorHandler`, `withValidation`, `createRateLimiter` stub
- ✅ `src/lib/utils/` — JSON envelope helpers (moved `cn`/`formatCurrency` into this folder)
- ✅ `src/lib/hooks/use-api.ts` — typed client fetch hook
- ✅ `src/app/api/**` — 24 route handlers (all dynamic), all returning structured `501` until Phase 4
- ✅ `src/middleware.ts` — root middleware (request id header)
- ✅ `.env` / `.env.example` — `DATABASE_URL`, `NEXTAUTH_*`, `RESEND_*`, `CLOUDINARY_*`, `STRIPE_*` placeholders
- ✅ `npm run build` + `next lint` + `tsc --noEmit` all clean

> Note: the "Schema Overview (Conceptual)" SQL below is the original design sketch. The authoritative, live model is `prisma/schema.prisma`.

---

## Phase 4: Booking Engine

### Goal
Build a production-grade booking engine that prevents double-bookings, handles concurrent requests, and provides real-time availability.

### System Design Concepts

#### Strong Consistency
- **Why**: Strong consistency guarantees that after a write completes, all subsequent reads return the updated value. For bookings, this is critical: if a room is booked, no other user should see it as available.
- **How**: PostgreSQL's `SERIALIZABLE` isolation level ensures that concurrent booking transactions are executed as if they ran sequentially. If two users attempt to book the same room for overlapping dates, one transaction succeeds and the other fails with a serialization error.
- **When**: Every booking write operation. Reads (availability checks) can use weaker isolation (`READ COMMITTED`) since stale data is acceptable for milliseconds.
- **Trade-off**: `SERIALIZABLE` reduces concurrency. For high-traffic hotels, an alternative is optimistic locking with application-level retry logic.

#### Eventual Consistency
- **Why**: Eventual consistency means given enough time without updates, all replicas will converge to the same value. It is acceptable for read models like "recent bookings" or "popular rooms" where milliseconds of staleness are tolerable.
- **How**: The booking engine uses strong consistency for writes and eventual consistency for read replicas. After a booking is confirmed, the update propagates to the read replica asynchronously.
- **When**: Relevant when read replicas are introduced (Phase 6 — replication).
- **Trade-off**: Stale reads. A user might briefly see a room as available after it was booked. Mitigate with short TTLs or read-your-writes consistency.

#### Idempotency
- **Why**: An idempotent operation produces the same result regardless of how many times it is executed. Without idempotency, a network retry could create duplicate bookings.
- **How**: The booking API accepts an `Idempotency-Key` header (a UUID generated by the client). Before processing a booking request, the server checks if a booking with that key exists. If yes, return the existing booking (safe retry). If no, create the booking and store the key.
- **When**: Essential for any payment-adjacent API. Implemented in the booking API endpoint.
- **Trade-off**: Requires persistent storage of idempotency keys (with TTL cleanup). Adds a database lookup per request.

#### Idempotency Keys
- **Why**: Idempotency keys prevent double charges and duplicate bookings when network failures cause clients to retry. Without them, a user who clicks "Book Now" twice (first request succeeded, response was lost) could be charged twice.
- **How**: On the `/api/book` endpoint:
  1. Client generates a UUID `idempotency_key` and sends it in the request header.
  2. Server checks `IdempotencyKey` table for the key.
  3. If found and completed → return cached response (no charge).
  4. If found and in-progress → return 409 Conflict.
  5. If not found → process booking, store key → return response.
- **When**: Implemented alongside the booking API in Phase 4.
- **Trade-off**: Idempotency keys must be stored with a TTL (typically 24 hours) and cleaned up. Longer TTL = more storage; shorter TTL = risk of duplicate outside the window.

### Future Expansion
- Add availability calendar widget
- Implement booking modification/cancellation
- Sync availability with external booking channels (Expedia, Booking.com)

### Verification
- Concurrent booking requests for the same room-date succeed exactly once
- Idempotent retries return the same booking without duplication
- Availability query excludes booked dates

---

## Phase 5: Payments

### Goal
Integrate payment processing (Paystack/Flutterwave) with transaction safety, failure handling, and reconciliation.

### System Design Concepts

#### Saga Pattern
- **Why**: The Saga pattern manages distributed transactions across multiple services without a global coordinator. A booking involves: (1) reserve room, (2) charge payment, (3) send confirmation. If step 2 fails, step 1 must be rolled back (cancel the reservation).
- **How**: A choreographed saga using event-driven communication:
  1. Booking Service creates a pending booking → emits `BookingCreated`.
  2. Payment Service listens, processes charge → emits `PaymentCompleted` or `PaymentFailed`.
  3. On `PaymentCompleted`: Booking Service marks booking confirmed.
  4. On `PaymentFailed`: Booking Service cancels the reservation.
- **When**: Implemented in Phase 5 when the payment microservice is introduced.
- **Trade-off**: Sagas add complexity (event handling, compensation logic, eventual consistency). Simpler: a single ACID transaction if both services share a database (but they don't in a microservice architecture).

#### Circuit Breaker
- **Why**: A circuit breaker prevents cascading failures. If the payment gateway (Paystack) becomes unresponsive, the circuit breaker "opens" and subsequent booking requests fail fast instead of waiting for timeouts. After a cooldown, it "half-opens" to test recovery.
- **How**: Wrap payment API calls in a circuit breaker (e.g., `opossum` for Node.js). Configuration:
  - Failure threshold: 5 consecutive failures
  - Timeout: 10 seconds per request
  - Reset timeout: 30 seconds (half-open)
  - On open state: immediately return error without calling Paystack
- **When**: Implemented alongside the payment service in Phase 5.
- **Trade-off**: False positives. A brief network glitch could open the circuit, blocking legitimate payments. Tune thresholds based on production metrics.

### Verification
- Successful payment → booking confirmed, email sent
- Failed payment → booking cancelled, user notified
- Circuit breaker opens on gateway timeout → fast failure
- Idempotency key prevents duplicate charges

---

## Phase 6: Authentication

### Goal
Implement user authentication with session management, password hashing, and JWT tokens for API access.

### System Design Concepts

#### Cache
- **Why**: Caching stores frequently accessed data in fast memory (RAM) instead of slower disk-based databases. For authentication, caching user sessions and JWT public keys reduces database load and request latency.
- **How**: Redis is used as an in-memory cache. After a successful login, the session is stored in Redis with a TTL. Subsequent requests validate the session from Redis (O(1)) instead of querying PostgreSQL.
- **When**: Introduced when login becomes the bottleneck. Typically Phase 6 or when traffic justifies it.
- **Trade-off**: Cache invalidation is hard. Stale sessions could allow access after logout. Mitigate with short TTLs (15 minutes) and strict cleanup.

#### Cache Aside
- **Why**: Cache Aside (lazy loading) is a caching strategy where the application loads data from the database on a cache miss, then populates the cache. Future reads hit the cache until eviction.
- **How**: On login:
  1. Check Redis for user session.
  2. On miss: query PostgreSQL for user, verify password, create session in Redis (TTL: 1 hour).
  3. Return session token.
  Subsequent requests repeat step 1.
- **When**: Used for any cached data (sessions, room availability queries, prices).
- **Trade-off**: Cache miss penalty (one extra database query). For hot keys (frequent access by many users), use Write-Through instead.

#### Replication
- **Why**: Replication creates copies of the database on multiple servers. Read replicas serve read queries, reducing load on the primary database. If the primary fails, a replica can be promoted.
- **How**: PostgreSQL streaming replication. Primary handles writes (booking, payment). Read replicas handle queries (room listings, availability checks). Prisma supports read replica routing via `@prisma/extension-read-replicas`.
- **When**: Relevant when the primary database consistently exceeds 80% CPU or query latency degrades.
- **Trade-off**: Replication lag (eventual consistency for reads). A user who just booked might not see their booking on the "My Bookings" page until replication catches up. Mitigate with read-your-writes.

### Verification
- Login/register flow works
- Session cached in Redis
- Read replicas serve room queries
- Primary failure promotes replica

---

## Phase 7: Hotel Services

### Goal
Build internal services management for restaurant, laundry, room service, pool, and housekeeping.

### System Design Concepts

#### Message Queue
- **Why**: A message queue decouples service producers from consumers. When a guest requests room service, the request goes into a queue. The kitchen staff picks it up when ready. If the kitchen is busy, the request waits — it is not lost.
- **How**: RabbitMQ or Redis Pub/Sub. Services publish messages to exchanges (e.g., `room_service.requested`, `laundry.completed`). Worker services consume from queues. Each service has its own queue, ensuring one failing service doesn't affect others.
- **When**: Introduced in Phase 7 when multiple internal services run simultaneously.
- **Trade-off**: Adds operational complexity (message broker setup, monitoring, dead letter handling). For a single-server setup, simpler alternatives like PostgreSQL LISTEN/NOTIFY or in-process queues may suffice.

#### Publish / Subscribe (Pub/Sub)
- **Why**: Pub/Sub is a messaging pattern where publishers emit events without knowing which services will handle them. Subscribers listen for events they care about. This enables loose coupling between services.
- **How**: Events are published to RabbitMQ exchanges:
  - `room_service.requested` → Subscribers: Kitchen Service, Notification Service
  - `laundry.requested` → Subscribers: Laundry Service, Notification Service
  - `housekeeping.alert` → Subscribers: Housekeeping Service, Front Desk Service
  Each subscriber processes independently. The Kitchen Service doesn't need to know about the Laundry Service.
- **When**: Same as message queue — Phase 7.
- **Trade-off**: Event ordering is not guaranteed. A `laundry.completed` event might arrive before `laundry.requested` if queues are misconfigured. Use sequence IDs or temporal ordering where ordering matters.

### Verification
- Room service request reaches kitchen queue
- Laundry request reaches laundry queue
- Multiple services consume events without interference
- Failed message goes to dead letter queue

---

## Phase 8: Notifications

### Goal
Implement real-time and asynchronous notifications: email confirmations, push notifications, and in-app alerts.

### System Design Concepts

#### Server-Sent Events (SSE)
- **Why**: SSE enables a server to push events to a client over a single HTTP connection. Unlike WebSockets, SSE is unidirectional (server → client) and uses standard HTTP, making it simpler for use cases like "new booking alert" or "room service status update."
- **How**: The frontend opens an `EventSource` connection to `/api/notifications/stream`. The backend sends events like `booking.confirmed`, `payment.received`, `service.updated`. The frontend updates the UI (e.g., toast notification) without polling.
- **When**: Implemented in Phase 8 for real-time dashboard updates and admin panel notifications.
- **Trade-off**: SSE has a maximum of ~6 concurrent connections per browser (HTTP/1.1). HTTP/2 multiplexing solves this. SSE also lacks bidirectional communication — for that, use WebSockets.

#### WebSockets
- **Why**: WebSockets provide full-duplex communication over a single TCP connection. For the hotel platform, WebSockets enable real-time chat between guests and the concierge desk, live booking status updates, and administrative dashboards.
- **How**: Socket.IO manages WebSocket connections with fallback to HTTP long-polling. Namespaces separate channels: `/concierge` for guest chat, `/admin` for staff updates, `/bookings` for live booking feed.
- **When**: Phase 8 for interactive features. SSE is sufficient for one-way notifications.
- **Trade-off**: WebSockets are stateful — horizontal scaling requires a shared pub/sub layer (Redis) to broadcast messages across server instances. SSE statelessness avoids this complexity.

#### Google Sheets Integration
- **Why**: During early operations, a Google Sheet can serve as a lightweight booking log visible to non-technical staff. Every booking submission writes a row to the sheet.
- **How**: Google Sheets API (service account) writes to a shared spreadsheet. Columns: booking ID, guest name, room, check-in, check-out, total, status. Staff can view and edit the sheet directly.
- **When**: Useful before a full admin dashboard is built (Phase 8). Serves as an interim operational tool.
- **Trade-off**: Google Sheets has API rate limits (60 requests/user/minute). Not suitable as a primary database. Concurrent edits can conflict. Consider it a temporary transparency layer.

#### Email Notifications
- **Why**: Email is the most reliable asynchronous notification channel. Booking confirmations, payment receipts, and promotional offers require email delivery.
- **How**: Use Resend or SendGrid with transactional email templates. On `BookingConfirmed` event, the Notification Service sends a confirmation email with booking details. Templates are stored in the email service and populated via API.
- **When**: Every booking and payment event triggers an email. Implemented in Phase 8 but designed in Phase 4.
- **Trade-off**: Email deliverability is complex (SPF, DKIM, DMARC, spam filters). Transactional email services (Resend, SendGrid) handle deliverability but add cost per email.

### Verification
- Booking confirmation email received
- SSE connection streams status updates
- Google Sheet receives booking rows
- WebSocket chat works between guest and concierge

---

## Phase 9: Production Scaling

### Goal
Scale the platform to handle high traffic, prevent overload, and ensure availability during peak demand.

### System Design Concepts

#### Horizontal Scaling
- **Why**: Horizontal scaling adds more machines (instances) to handle increased load, rather than upgrading a single machine (vertical scaling). For the hotel platform, during peak booking season, additional server instances handle the traffic spike.
- **How**: Deploy multiple Next.js instances behind a load balancer. Each instance is stateless — sessions stored in Redis, files in object storage, database connections via connection pool. Vercel automatically scales serverless functions horizontally.
- **When**: When traffic exceeds single-instance capacity. For Vercel, scaling is automatic. For self-hosted, add instances behind a load balancer.
- **Trade-off**: Statelessness is required for horizontal scaling — any instance must handle any request. Local filesystem state (uploaded images, in-memory caches) breaks horizontal scaling.

#### Load Balancer
- **Why**: A load balancer distributes incoming requests across multiple backend servers. It performs health checks, handles failover, and terminates SSL. Users never connect directly to application servers.
- **How**: A reverse proxy (NGINX, HAProxy, or cloud LB) distributes traffic across Next.js instances. Algorithm: round-robin for static content, least-connections for API requests. Health checks every 5 seconds; unhealthy instances are removed from the pool.
- **When**: Introduced with horizontal scaling (Phase 9).
- **Trade-off**: The load balancer is a single point of failure unless itself deployed in a high-availability pair. TLS termination at the LB adds CPU overhead.

#### Load Shedding
- **Why**: Load shedding drops non-critical requests when the system is under extreme stress to protect core functionality. During a flash sale or holiday rush, the platform might shed promotional image loading to keep booking requests processing.
- **How**: Implement priority-based request handling:
  1. Critical: Booking API, Payment API (always processed)
  2. Important: Availability checks (processed unless queue > 80%)
  3. Best-effort: Image optimization, analytics (dropped first)
  Implemented via request queuing with priority levels or circuit breaker on non-critical endpoints.
- **When**: Implemented when traffic patterns show predictable spikes (holidays, promotions).
- **Trade-off**: Degraded UX during load shedding (images fail to load). Must communicate clearly ("High traffic — some features may be temporarily limited").

#### Bloom Filter
- **Why**: A Bloom filter is a probabilistic data structure that answers "is this element in the set?" with possible false positives (but never false negatives). For the hotel platform, a Bloom filter can quickly check if a room ID exists before querying the database, reducing unnecessary lookups.
- **How**: When rooms are loaded, their IDs are added to a Bloom filter in Redis. Before querying `SELECT * FROM bookings WHERE room_id = X`, the application first checks the Bloom filter. If the filter says "not present," skip the query entirely (saving database load). False positives result in a harmless database query that returns zero rows.
- **When**: Useful when the platform has many rooms and high query volume. Cache layer (Redis) already exists from Phase 6.
- **Trade-off**: Cannot delete from a standard Bloom filter (Counting Bloom Filters support deletion). False positives waste small amounts of database time. Space-efficient: ~10 MB for millions of room IDs at 1% false positive rate.

### Verification
- Load test with 1000 concurrent users completes without errors
- Load balancer distributes requests evenly
- Load shedding drops non-critical requests under stress
- Bloom filter reduces unnecessary database queries

---

## Phase 10: AI Concierge

### Goal
Implement an AI-powered concierge for natural language queries, personalized recommendations, and automated FAQ responses.

### System Design Concepts

#### Embeddings
- **Why**: Embeddings are vector representations of text that capture semantic meaning. They enable semantic search ("find rooms similar to this one") and natural language understanding ("I want a quiet room with a view"). Traditional keyword search can't match "quiet room" to "soundproofed suite with city panorama."
- **How**: Hotel knowledge (room descriptions, service details, policies, FAQs) is converted to embeddings using OpenAI's `text-embedding-3-small` or an open-source model like `all-MiniLM-L6-v2`. Embeddings are stored in a vector database (pgvector on PostgreSQL, Pinecone, or Qdrant).
- **When**: Introduced in Phase 10. Requires Phase 3 database for content storage.
- **Trade-off**: Embedding generation has API cost (for OpenAI models) or compute cost (for local models). Embeddings change when content changes — require re-indexing.

#### Retrieval-Augmented Generation (RAG)
- **Why**: RAG combines information retrieval with LLM text generation. When a guest asks "Is the pool open at 6 AM?", the system retrieves relevant documents (pool hours policy) from the vector database and feeds them to the LLM as context. The LLM generates an answer grounded in the retrieved data, reducing hallucinations.
- **How**: Architecture:
  1. User query: "Is the pool open at 6 AM?"
  2. Convert query to embedding.
  3. Query vector DB for top-3 similar documents (pool hours, FAQ).
  4. Retrieve document text.
  5. Prompt LLM with: "Answer based on this context: [documents]. Question: [query]"
  6. LLM generates: "Our pool opens at 7:00 AM daily."
- **When**: Phase 10 alongside embeddings.
- **Trade-off**: RAG adds latency (embedding → vector search → LLM generation). Total response time: 2–5 seconds. Caching frequent queries reduces this. RAG also increases cost per query (LLM token usage).

#### Semantic Search
- **Why**: Unlike keyword search which matches exact words, semantic search understands meaning. A search for "romantic getaway" should return penthouse suites with jacuzzis, not just rooms containing the word "romantic."
- **How**: Same embedding infrastructure as RAG. User search queries are embedded and compared against room/service embeddings using cosine similarity. Top-N results are returned.
- **When**: Phase 10. Enhances the room search experience on the booking page.
- **Trade-off**: Semantic search is more computationally expensive than full-text search (PostgreSQL `tsvector`). A hybrid approach (semantic + keyword) balances recall and cost.

#### Hotel Knowledge
- **Why**: The AI concierge must be trained on domain-specific knowledge: room features, service hours, pricing policies, local attractions. Generic LLMs don't know that "The Kings Hotel" pool opens at 7 AM.
- **How**: Knowledge base documents are:
  - Room descriptions and features (from database)
  - Service catalog (from Phase 2 data)
  - Policies (cancellation, check-in/out times)
  - Local area guide (restaurants, attractions)
  - FAQ (from operations team)
  These documents form the corpus for embedding and retrieval.
- **When**: Built and maintained from Phase 10 onward. Updates when policies change.
- **Trade-off**: Knowledge base maintenance is manual. Outdated information leads to incorrect answers. Implement freshness checks and a human-in-the-loop review process.

#### Recommendations
- **Why**: Personalized recommendations improve conversion and guest satisfaction. Based on booking history and preferences, the AI suggests room upgrades, dinner reservations, or spa packages.
- **How**: Collaborative filtering (users who booked X also booked Y) or content-based filtering (rooms similar to previously booked ones). RAG can power natural language recommendations: "Based on your last stay, you might enjoy our new Executive Suite with a private balcony."
- **When**: Phase 10, after sufficient booking data exists (Phase 4).
- **Trade-off**: Cold start problem — new users with no history get generic recommendations. Mitigate with popularity-based fallback.

#### FAQ
- **Why**: Automating FAQ responses reduces front desk workload. Common questions (check-in time, Wi-Fi password, breakfast hours) can be answered instantly without human intervention.
- **How**: RAG-powered FAQ: for each question, retrieve the relevant policy document and generate a concise answer. Integrate into a chat widget on the website and in-room tablet.
- **When**: Phase 10. Can be deployed as a standalone chatbot before full AI concierge.
- **Trade-off**: FAQ automation fails for novel or complex queries. Always provide a "Speak to a human" fallback to avoid guest frustration.

### Verification
- AI concierge answers correctly on known topics
- Semantic search returns relevant rooms for natural language queries
- Recommendations improve booking conversion
- FAQ bot resolves >80% of common questions without human handoff

---

## Advanced System Design Concepts

This section maps concepts to the hotel platform's potential evolution into a large distributed system.

### NoSQL
- **When useful**: Eventually, the `Booking` table may grow beyond PostgreSQL's comfortable range, or the platform needs flexible schemas for service requests (room service items vary by order). A document store (MongoDB) or wide-column store (Cassandra) could supplement PostgreSQL.
- **Trade-off**: NoSQL sacrifices ACID guarantees (typically BASE: Basically Available, Soft state, Eventual consistency). Booking accuracy requires ACID; service logs can tolerate BASE.

### Sharding
- **When useful**: When the `Booking` table exceeds tens of millions of rows, sharding splits data across multiple PostgreSQL instances. Example: shard by `hotel_id` for a multi-hotel chain.
- **Trade-off**: Cross-shard queries (e.g., "all my bookings across properties") become complex. Application code must route queries to the correct shard.

### Consistent Hashing
- **When useful**: In a distributed cache (Redis Cluster), consistent hashing distributes keys evenly across nodes. When a node is added or removed, only K/N keys are remapped (where K = total keys, N = nodes), minimizing cache churn.
- **How**: Redis Cluster uses consistent hashing internally. The application shards sessions across Redis nodes without central coordination.

### Consistent Hashing Ring
- **When useful**: Same as consistent hashing. The ring topology ensures that each node owns a range of hash values. Virtual nodes (vnodes) balance load when nodes have different capacities.
- **Trade-off**: Ring management adds complexity. Each node must know the ring state. Handled transparently by Redis Cluster and Amazon ElastiCache.

### Distributed Systems
- **When useful**: The hotel platform becomes a distributed system when it spans multiple servers: frontend (Vercel edge), backend (Vercel serverless), database (RDS), cache (ElastiCache), and workers (ECS/Fargate). Each component runs on a separate machine and communicates over the network.
- **Trade-off**: Distributed systems introduce partial failure, network latency, and coordination challenges (CAP theorem). A monolith is simpler but less scalable.

### CAP Theorem
- **When useful**: When choosing between consistency, availability, and partition tolerance for distributed components. The platform must pick two:
  - **Booking system**: Prefers Consistency + Partition Tolerance (CP). If the network partitions, reject bookings rather than double-book.
  - **Room catalog**: Prefers Availability + Partition Tolerance (AP). Serve stale room data rather than showing errors.
- **Trade-off**: No system can provide all three. The platform must make per-component trade-offs based on business requirements.

### Consensus
- **When useful**: Consensus algorithms (Raft, Paxos) ensure multiple servers agree on a single value. For the hotel platform, consensus is needed for leader election in a replicated Postgres setup (Patroni uses Raft/etcd) and for distributed locking (ensuring only one service instance processes a booking payment).
- **Trade-off**: Consensus adds latency — Raft requires a majority (N/2 + 1) of nodes to agree before committing. Network delays increase write latency.

### Leader Election
- **When useful**: In a replicated database cluster, one node is the leader (accepts writes); others are followers. If the leader fails, followers must elect a new leader. Patroni manages this with etcd and Raft.
- **Trade-off**: Split-brain — if a network partition isolates the leader, followers may elect a new leader while the old leader still thinks it's active. Mitigate with fencing (revoking the old leader's access to shared storage).

### Clock Skew
- **When useful**: Clock skew (difference in system time between servers) causes problems with timestamp-based ordering. If server A creates a booking at 10:00:01 and server B creates one at 10:00:00 (due to skew), the sequence of events is ambiguous.
- **Trade-off**: Use NTP (Network Time Protocol) to synchronize clocks within milliseconds. For critical ordering, use logical clocks (Lamport timestamps) or vector clocks instead of wall clocks.

### Vector Clocks
- **When useful**: Vector clocks track causality across distributed nodes without relying on synchronized clocks. For the hotel platform, if a guest updates their booking from room 101 to 305 while staff simultaneously changes the guest name, vector clocks determine which event happened first (causal order).
- **Trade-off**: Vector clocks grow with the number of nodes. Prune old entries periodically. Implemented in distributed databases (Cassandra, Riak) rather than application code.

### Write-Through
- **When useful**: Write-through cache strategy: when an availability update is written to the database, it is also written to the cache before returning. This ensures the cache is always fresh.
- **How**: On successful booking creation, update `room_availability` in both PostgreSQL and Redis in the same transaction.
- **Trade-off**: Slower writes (two operations instead of one). Read performance improves at the cost of write latency.

### Write-Behind
- **When useful**: Write-behind cache strategy: data is written to cache immediately and asynchronously to the database. For non-critical data (page views, analytics), this improves write throughput.
- **How**: Analytics events are written to Redis and batched to PostgreSQL every 10 seconds or 1000 events.
- **Trade-off**: Data loss risk if the cache fails before the database write completes. Only suitable for non-critical data.

### Dead Letter Queue (DLQ)
- **When useful**: A DLQ stores messages that a worker service failed to process after multiple retries. For the hotel platform, a payment confirmation message that fails to send to the email service after 3 retries goes to the DLQ for manual inspection.
- **How**: RabbitMQ DLQ configuration: after 3 failed delivery attempts (nack), the message is routed to the DLQ exchange. An alert is sent to operations. An admin can reprocess or discard messages from the DLQ.
- **Trade-off**: DLQ messages require human intervention. Without proper monitoring, messages can sit in the DLQ indefinitely, causing silent failures.

### Backpressure
- **When useful**: Backpressure is a mechanism where a slow consumer signals the producer to slow down, preventing the consumer from being overwhelmed. If the email service is throttled (sending too many emails), it signals backpressure to the booking service, which pauses sending new confirmation requests.
- **How**: RabbitMQ consumer prefetch limits, TCP flow control, or explicit backpressure signals via a shared Redis counter. The booking service polls the counter before enqueuing new email tasks.
- **Trade-off**: Backpressure can cascade — if email is slow, booking confirmation queue grows, which may block new bookings. Mitigate with separate queues per priority.

### Event Sourcing
- **When useful**: Event sourcing stores every state change as an append-only event log, rather than the current state. For the hotel platform, this means storing every `BookingCreated`, `BookingModified`, `BookingCancelled`, `PaymentReceived` event. The current booking state is derived by replaying events.
- **How**: Events are stored in PostgreSQL or a dedicated event store. Event replay reconstructs state. Events are published to a message queue for downstream services.
- **Trade-off**: Event sourcing is complex (event schema versioning, replay time, querying current state requires projection). It is valuable for auditing and debugging but overkill for most hotel platforms until regulatory requirements (e.g., PCI-DSS for payments) demand it.

### Two-Phase Commit (2PC)
- **When useful**: 2PC coordinates a transaction across multiple databases or services to ensure all or nothing. For the hotel platform, a 2PC could ensure that (a) a booking is created in PostgreSQL and (b) the room availability is updated in Redis — both succeed or both fail.
- **How**: A coordinator asks each participant to prepare. If all prepare, the coordinator sends commit. If any fails to prepare, all roll back. Implemented via distributed transaction coordinators (e.g., XA protocol, Seata).
- **Trade-off**: 2PC is slow (multiple network round trips) and not fault-tolerant (if the coordinator fails after prepare, participants are locked until recovery). Most modern architectures avoid 2PC in favor of Sagas with compensating transactions.

---

## Summary of System Design Concepts

| # | Concept | Phase | Category |
|---|---------|-------|----------|
| 1 | Scalability | 1 | Architecture |
| 2 | Vertical Scaling | 1 | Scaling |
| 3 | Latency | 1 | Performance |
| 4 | Throughput | 1 | Performance |
| 5 | DNS | 1 | Networking |
| 6 | CDN | 2 | Performance |
| 7 | Reverse Proxy | 2 | Networking |
| 8 | API Gateway | 2 | Architecture |
| 9 | Object Storage | 2 | Storage |
| 10 | Rate Limiting | 2 | Security |
| 11 | Database | 3 | Storage |
| 12 | SQL | 3 | Storage |
| 13 | ACID | 3 | Transactions |
| 14 | Indexes | 3 | Performance |
| 15 | Data Partitioning | 3 | Scaling |
| 16 | Strong Consistency | 4 | Transactions |
| 17 | Eventual Consistency | 4 | Transactions |
| 18 | Idempotency | 4 | Reliability |
| 19 | Idempotency Keys | 4 | Reliability |
| 20 | Saga Pattern | 5 | Transactions |
| 21 | Circuit Breaker | 5 | Reliability |
| 22 | Cache | 6 | Performance |
| 23 | Cache Aside | 6 | Performance |
| 24 | Replication | 6 | Reliability |
| 25 | Message Queue | 7 | Async |
| 26 | Publish/Subscribe | 7 | Async |
| 27 | Server Sent Events | 8 | Real-time |
| 28 | WebSockets | 8 | Real-time |
| 29 | Google Sheets Integration | 8 | Operations |
| 30 | Email Notifications | 8 | Async |
| 31 | Horizontal Scaling | 9 | Scaling |
| 32 | Load Balancer | 9 | Networking |
| 33 | Load Shedding | 9 | Reliability |
| 34 | Bloom Filter | 9 | Performance |
| 35 | Embeddings | 10 | AI/ML |
| 36 | Retrieval-Augmented Generation | 10 | AI/ML |
| 37 | Semantic Search | 10 | AI/ML |
| 38 | Hotel Knowledge | 10 | AI/ML |
| 39 | Recommendations | 10 | AI/ML |
| 40 | FAQ | 10 | AI/ML |
| 41 | NoSQL | Advanced | Storage |
| 42 | Sharding | Advanced | Scaling |
| 43 | Consistent Hashing | Advanced | Scaling |
| 44 | Consistent Hashing Ring | Advanced | Scaling |
| 45 | Distributed Systems | Advanced | Architecture |
| 46 | CAP Theorem | Advanced | Architecture |
| 47 | Consensus | Advanced | Reliability |
| 48 | Leader Election | Advanced | Reliability |
| 49 | Clock Skew | Advanced | Distributed |
| 50 | Vector Clocks | Advanced | Distributed |
| 51 | Write-Through | Advanced | Performance |
| 52 | Write-Behind | Advanced | Performance |
| 53 | Dead Letter Queue | Advanced | Reliability |
| 54 | Backpressure | Advanced | Reliability |
| 55 | Event Sourcing | Advanced | Storage |
| 56 | Two-Phase Commit | Advanced | Transactions |

---

*This document is a living roadmap. Update as the platform evolves and new requirements emerge.*
