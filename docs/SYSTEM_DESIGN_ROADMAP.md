# System Design Roadmap — The Kings Hotel

> A learning-oriented progression from monolith to distributed system.

---

## How to Use This Roadmap

Each phase builds on the previous one, introducing new system design concepts in the natural order they would become relevant for a growing hotel platform. For each concept, the roadmap answers:

- **What** is it?
- **Why** does The Kings Hotel need it?
- **How** is it implemented in this project?
- **When** is the right time to introduce it?
- **Trade-offs** that inform the decision.

---

## Phase 1: Foundation

**Concept**: Monolith → Design system → Single server

| Concept | Relevance to Hotel Platform |
|---------|---------------------------|
| **Scalability** | Reusable components in `/components/ui/` eliminate duplication, making the codebase scalable for future pages |
| **Vertical Scaling** | One Next.js server is sufficient for a marketing site; upgrade CPU/RAM when traffic grows |
| **Latency** | SSG pre-renders pages at build time; `next/font` self-hosts fonts; `next/image` optimizes images |
| **Throughput** | Static pages served via CDN handle hundreds of concurrent visitors |
| **DNS** | Domain → Vercel via CNAME; TLS via Let's Encrypt |

**Key Insight**: System design starts before the first database. How you structure components, choose build strategies, and configure assets determines your scalability ceiling from day one.

---

## Phase 2: Public Website

**Concept**: Static site → CDN → Edge delivery

| Concept | Relevance to Hotel Platform |
|---------|---------------------------|
| **CDN** | Vercel Edge Network caches static pages at 100+ locations worldwide |
| **Reverse Proxy** | Vercel terminates SSL, routes requests, and serves cached content before reaching the app server |
| **API Gateway** | Conceptual now; will route `/api/bookings`, `/api/payments`, `/api/auth` to microservices |
| **Object Storage** | `/public/images/` works now; Cloudinary/S3 needed for scale and transformation |
| **Rate Limiting** | Contact form needs 5 req/min/IP; booking form needs 3 req/min/IP |

**Key Insight**: A static site is the easiest system to scale. These concepts prepare the architecture for dynamic, stateful services in later phases.

---

## Phase 3: Database & ORM

**Concept**: No state → Persistent state → Data modeling

| Concept | Relevance to Hotel Platform |
|---------|---------------------------|
| **Database** | PostgreSQL stores rooms, bookings, users, payments, availability |
| **SQL** | Prisma ORM generates SQL for complex availability queries |
| **ACID** | Prevents double-booking; ensures payment + booking are atomic |
| **Indexes** | Speed up availability queries, login lookups, booking history |
| **Data Partitioning** | Partition `Booking` by month when table exceeds 10M rows |

**Key Insight**: The database is the heart of the system. Getting schema design, indexing strategy, and transaction isolation right determines the correctness and performance of every higher-level feature.

---

## Phase 4: Booking Engine

**Concept**: Safe writes → Concurrent access → Data integrity

| Concept | Relevance to Hotel Platform |
|---------|---------------------------|
| **Strong Consistency** | SERIALIZABLE isolation prevents double-booking |
| **Eventual Consistency** | Read replicas may lag; acceptable for room browsing, not booking |
| **Idempotency** | Network retries don't create duplicate bookings |
| **Idempotency Keys** | UUID per booking request; server deduplicates |

**Key Insight**: Booking is the hardest problem in this platform. It requires strong guarantees that most web applications can skip. Idempotency and strong consistency are non-negotiable.

---

## Phase 5: Payments

**Concept**: External dependencies → Failure handling → Compensation

| Concept | Relevance to Hotel Platform |
|---------|---------------------------|
| **Saga Pattern** | Choreographed events: BookingCreated → PaymentProcessed → BookingConfirmed. Compensation: PaymentFailed → BookingCancelled |
| **Circuit Breaker** | Opens when Paystack is unresponsive; fails fast instead of timing out |

**Key Insight**: Payments introduce an external dependency you cannot control. Saga patterns and circuit breakers are the minimum viable reliability patterns for any money-handling system.

---

## Phase 6: Authentication

**Concept**: Sessions → Caching → Read replicas

| Concept | Relevance to Hotel Platform |
|---------|---------------------------|
| **Cache** | Redis stores user sessions (15-min TTL) |
| **Cache Aside** | On cache miss: query PostgreSQL → populate Redis → return |
| **Replication** | PostgreSQL read replicas serve room queries; primary handles writes |

**Key Insight**: Auth is the gateway. Caching sessions reduces database load, and replication ensures the primary is free for critical writes (bookings, payments).

---

## Phase 7: Hotel Services

**Concept**: Synchronous → Asynchronous → Decoupled services

| Concept | Relevance to Hotel Platform |
|---------|---------------------------|
| **Message Queue** | RabbitMQ decouples room service requests from kitchen processing |
| **Publish/Subscribe** | Events: `room_service.requested`, `laundry.completed`, `housekeeping.alert` |

**Key Insight**: Internal services (kitchen, laundry, housekeeping) don't need synchronous responses. Message queues decouple them, allowing each service to scale independently and fail without cascading.

---

## Phase 8: Notifications

**Concept**: Pull → Push → Real-time

| Concept | Relevance to Hotel Platform |
|---------|---------------------------|
| **SSE** | Server pushes booking status updates to admin dashboard (unidirectional) |
| **WebSockets** | Guest-concierge chat, live booking feed (bidirectional) |
| **Google Sheets** | Staff-readable booking log before admin dashboard exists |
| **Email** | Booking confirmations, payment receipts via Resend/SendGrid |

**Key Insight**: Different notification channels serve different needs. SSE for simple updates, WebSockets for interactive features, email for reliability. Use the right tool for each job.

---

## Phase 9: Production Scaling

**Concept**: One instance → Many instances → Defense in depth

| Concept | Relevance to Hotel Platform |
|---------|---------------------------|
| **Horizontal Scaling** | Stateless Next.js instances behind a load balancer |
| **Load Balancer** | Distributes traffic, health checks, SSL termination |
| **Load Shedding** | Drop non-critical requests (image loading) to protect booking |
| **Bloom Filter** | Quick room-ID existence check before DB query; reduces unnecessary reads |

**Key Insight**: Scaling is not just adding servers. It requires stateless application design, smart routing, and graceful degradation under load.

---

## Phase 10: AI Concierge

**Concept**: Keyword → Semantic → Generative

| Concept | Relevance to Hotel Platform |
|---------|---------------------------|
| **Embeddings** | Convert room descriptions, policies, FAQs to vectors for semantic search |
| **RAG** | Retrieve relevant documents → LLM generates grounded answer |
| **Semantic Search** | "quiet room with view" matches "soundproofed suite with city panorama" |
| **Hotel Knowledge** | Domain-specific corpus (room features, policies, local guide) |
| **Recommendations** | Collaborative filtering + content-based suggestions |
| **FAQ** | Automate common questions via RAG; human fallback for novel queries |

**Key Insight**: AI adds intelligence on top of the existing data layer. Embeddings and RAG extract value from content you already have (room descriptions, policies, FAQs) without requiring new data sources.

---

## Advanced Concepts

These concepts become relevant if The Kings Hotel grows into a multi-property, multi-region distributed platform.

| Concept | Scenario |
|---------|----------|
| **NoSQL** | Flexible schemas for service requests (room service items vary by order) |
| **Sharding** | Split Booking table across DB instances by hotel_id |
| **Consistent Hashing** | Redis Cluster distributes session cache across nodes |
| **CAP Theorem** | Booking = CP; Room catalog = AP |
| **Consensus (Raft)** | Postgres leader election via Patroni + etcd |
| **Leader Election** | Failover in replicated database cluster |
| **Clock Skew** | NTP synchronization; logical clocks for ordering |
| **Vector Clocks** | Causal ordering of concurrent updates (guest edits vs staff edits) |
| **Write-Through** | Cache + DB updated atomically for availability |
| **Write-Behind** | Async analytics writes to DB via Redis buffer |
| **Dead Letter Queue** | Failed payment confirmation emails for manual retry |
| **Backpressure** | Email service throttling signals booking service to slow down |
| **Event Sourcing** | Append-only event log for full audit trail |
| **Two-Phase Commit** | Distributed transaction across Postgres + Redis (avoid in practice; use Sagas) |

---

## Learning Path

```
Phase 1  → Phase 2  → Phase 3  → Phase 4  → Phase 5  → Phase 6  → Phase 7  → Phase 8  → Phase 9  → Phase 10
Monolith    Static      DB          Booking     Payments    Auth        Async       Real-time   Scale       AI
            Site        Design      Engine                   Cache       Queues      Notifs
```

Each phase introduces ~4–6 new concepts. By Phase 10, you've touched every major category of system design:

- **Performance**: Latency, Throughput, Cache, CDN, Bloom Filter
- **Reliability**: Circuit Breaker, Idempotency, Replication, Dead Letter Queue
- **Transactions**: ACID, Saga, Strong Consistency, Two-Phase Commit
- **Scaling**: Vertical, Horizontal, Sharding, Consistent Hashing, Data Partitioning
- **Async**: Message Queue, Pub/Sub, Event Sourcing, Write-Behind
- **Real-time**: SSE, WebSockets
- **AI/ML**: Embeddings, RAG, Semantic Search, Recommendations

---

*Proceed at your own pace. Build each phase, deploy it, and only move forward when the current phase is stable in production.*
