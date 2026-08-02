# Architecture Overview — The Kings Hotel

---

## Current Architecture (Phase 4)

```
┌─────────────────────────────────────────────────────────┐
│                   Browser (Client)                       │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────┐
│           Vercel Edge Network (CDN + Reverse Proxy)      │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐   │
│  │ Static HTML  │  │ next/image  │  │ Serverless     │   │
│  │ (SSG pages)  │  │ CDN cache   │  │ Functions      │   │
│  └─────────────┘  └─────────────┘  └───────┬───────┘   │
└────────────────────────────────────────────┼────────────┘
                                             │
                  ┌──────────────────────────┘
                  │
┌─────────────────▼────────────────────────────────────────┐
│              Next.js 15.5 (App Router)                   │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐   │
│  │ Layouts      │  │ Pages       │  │ Components     │   │
│  │ (Root,       │  │ (22 static  │  │ (UI + Section) │   │
│  │  Public)     │  │  pages)     │  │                │   │
│  └─────────────┘  └─────────────┘  └───────────────┘   │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐   │
│  │ Data Layer   │  │ Utils       │  │ Design System  │   │
│  │ (/lib/data)  │  │ (cn,        │  │ (Tailwind +    │   │
│  │              │  │  formatCurr)│  │  shadcn/ui)    │   │
│  └─────────────┘  └─────────────┘  └───────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Layer Descriptions

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **CDN** | Vercel Edge Network | Caches static HTML, CSS, JS, optimized images at 100+ edge locations |
| **Reverse Proxy** | Vercel | SSL termination, request routing, cache hit/miss decisions |
| **Pages** | Next.js App Router | 22 static pages; pre-rendered at build time (SSG) |
| **API Routes** | Next.js Route Handlers | 29 dynamic `src/app/api/**` handlers — auth live, business logic stubbed (`NotImplementedError`) |
| **Auth** | Auth.js (NextAuth v5 beta) | JWT sessions, credentials login, RBAC, edge-safe middleware (86.7 kB, no Prisma) |
| **Components** | React + Tailwind | Reusable UI primitives and section components |
| **Data** | TypeScript modules | Static data (rooms, services, navigation, testimonials) |
| **Images** | `/public/images/` + Unsplash | Local hero/room images; remote gallery images via `next/image` |

### Current Deployment

- **Hosting**: Vercel (Production) / localhost (Development)
- **Build**: `next build` produces static HTML + serverless function bundles
- **Routing**: App Router — `(public)` and `(auth)` route groups for consistent layouts
- **State**: Public content is static (TypeScript data modules); auth flows use Prisma (PostgreSQL required — live DB flows pending a local instance)
- **Frontend cleanup (Phase 3.5)**: single data source per domain, no orphan routes, token-only styling, per-page metadata + `robots.ts`/`sitemap.ts`, validated PATCH bodies, `moduleResolution: "bundler"`

---

## Target Architecture (Phase 10)

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Browser      │   │  Mobile App  │   │  Admin Panel  │
│  (Next.js)    │   │  (React      │   │  (Next.js)    │
│               │   │   Native)    │   │               │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │ HTTPS
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                 Cloudflare / AWS CloudFront                   │
│          (CDN + WAF + SSL Termination + Rate Limiting)        │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                     Load Balancer (ALB / NGINX)               │
│              (Round-robin / Least-connections)                │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    API Gateway (Kong / AWS)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ Rate     │ │ Auth     │ │ Request  │ │ Response     │   │
│  │ Limiting │ │ (JWT)    │ │ Routing  │ │ Transform    │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
└──────────────────────────┬───────────────────────────────────┘
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Next.js      │  │ Next.js      │  │ Next.js      │
│ Instance 1   │  │ Instance 2   │  │ Instance 3   │
│ (Stateless)  │  │ (Stateless)  │  │ (Stateless)  │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                     Redis Cluster                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Sessions     │  │ Cache (Room  │  │ Pub/Sub          │   │
│  │ (Auth)       │  │  Avail.)     │  │ (Events)         │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│              PostgreSQL (Primary + Read Replicas)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Primary      │  │ Read Replica │  │ Read Replica     │   │
│  │ (Writes)     │  │ 1 (Queries)  │  │ 2 (Analytics)    │   │
│  └──────┬───────┘  └──────────────┘  └──────────────────┘   │
│         │                                                     │
│         ▼                                                     │
│  ┌──────────────┐                                            │
│  │ PG Vector    │  ← Embeddings for AI Concierge             │
│  └──────────────┘                                            │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│             Message Queue (RabbitMQ)                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ Booking  │ │ Payment  │ │ Service  │ │ Notification │   │
│  │ Queue    │ │ Queue    │ │ Queue    │ │ Queue        │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                   Worker Services (ECS / Lambda)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ Email    │ │ Payment  │ │ Laundry  │ │ AI Concierge  │   │
│  │ Worker   │ │ Worker   │ │ Worker   │ │ Worker       │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                   External Services                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ Paystack │ │ Resend   │ │ Cloudinary│ │ OpenAI        │   │
│  │ (Pay)    │ │ (Email)  │ │ (Images) │ │ (AI)          │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Migration Path

| Phase | Architecture Change |
|-------|-------------------|
| 1–2 | Monolithic Next.js on Vercel (static + serverless) |
| 3 | Add PostgreSQL (via Supabase or AWS RDS) + Prisma |
| 4 | Add booking API endpoints (`/api/book`) |
| 5 | Add payment service + webhook handlers |
| 6 | Add Redis for sessions + authentication service |
| 7 | Add RabbitMQ + worker services for hotel operations |
| 8 | Add WebSocket server + email service integration |
| 9 | Horizontally scale Next.js instances + load balancer |
| 10 | Add pgvector + LLM integration for AI concierge |

---

## Key Architecture Decisions

### 1. Next.js App Router (Monolith First)
- **Decision**: Start with a single Next.js application for both frontend and API.
- **Rationale**: Simplifies development, deployment, and debugging. The monolith can be split into microservices when traffic or team size justifies it.
- **Trade-off**: The monolith cannot scale individual components independently. If the booking API needs more resources than the marketing pages, both share the same infrastructure.

### 2. Vercel for Hosting
- **Decision**: Deploy on Vercel's platform.
- **Rationale**: Built-in CDN, serverless functions, automatic SSL, preview deployments, and seamless Next.js integration. Zero DevOps overhead for Phases 1–2.
- **Trade-off**: Vendor lock-in. Cold starts for serverless functions. Limited control over server configuration.

### 3. PostgreSQL + Prisma
- **Decision**: Use PostgreSQL for relational data with Prisma as the ORM.
- **Rationale**: PostgreSQL offers ACID compliance (critical for bookings), is mature and well-supported, and supports extensions (pgvector for embeddings). Prisma provides type-safe queries and automatic migrations.
- **Trade-off**: PostgreSQL requires more operational knowledge than a managed NoSQL solution. Prisma adds an abstraction layer that can generate suboptimal queries.

### 4. Redis for Caching + Sessions
- **Decision**: Redis as the caching layer and session store.
- **Rationale**: Redis is the industry standard for caching — fast, simple data structures, built-in TTL, pub/sub capabilities. It also serves as the session store for horizontally scaled Next.js instances.
- **Trade-off**: Redis is in-memory — data loss on restart without persistence. Adds infrastructure cost and operational complexity.

### 5. Event-Driven Architecture (Phases 4+)
- **Decision**: Use message queues (RabbitMQ) for inter-service communication.
- **Rationale**: Decouples services, allows independent scaling, provides durability guarantees. A booking event can trigger payment processing, email confirmation, and analytics logging without any service knowing about the others.
- **Trade-off**: Eventual consistency across services. Debugging event flows is harder than debugging synchronous request-response.

---

## Data Flow Examples

### Booking Flow (Future)
```
1. User submits booking on /book
2. Next.js calls POST /api/bookings
3. API Gateway authenticates (JWT), rate-limits (3/min)
4. Booking Service validates availability (PostgreSQL query)
5. Booking Service creates pending booking (ACID transaction)
6. Booking Service publishes BookingCreated event (RabbitMQ)
7. Payment Worker consumes event, calls Paystack API
8. Payment Worker publishes PaymentCompleted or PaymentFailed
9. Booking Service updates booking status (confirmed/cancelled)
10. Notification Worker sends email confirmation
11. Response returned to client (SSE pushes status update)
```

### AI Concierge Flow (Future)
```
1. User asks: "What time does the pool open?"
2. Frontend sends query to /api/concierge/chat
3. Concierge Service embeds query (text-embedding-3-small)
4. Vector search (pgvector): find top-3 relevant documents
5. Retrieved documents + query → OpenAI chat completion
6. LLM generates: "Our pool opens at 7:00 AM daily."
7. Response streamed back to chat widget
```

---

## Security Architecture

| Layer | Measure |
|-------|---------|
| **Transport** | HTTPS via Let's Encrypt (Vercel) |
| **API** | JWT-based authentication (Phase 6) |
| **Rate Limiting** | IP-based: 5 req/min for forms (Phase 4) |
| **Database** | No direct exposure; accessed only through API |
| **Payment** | Paystack server-side integration; never handle raw card data |
| **XSS** | React's JSX escapes values by default; Content-Security-Policy header |
| **CORS** | Restrict to known domains |
| **DDoS** | Vercel's edge network provides basic DDoS protection |

---

## Monitoring & Observability (Future)

| Tool | Purpose |
|------|---------|
| Vercel Analytics | Real-user monitoring, page views, Core Web Vitals |
| Sentry | Error tracking for frontend and backend |
| DataDog / Grafana | Server metrics, database performance, queue depths |
| Pino / Winston | Structured logging with correlation IDs |
| Uptime Robot | External health check every 5 minutes |

---

*This document reflects the current architecture (Phase 2) and the planned evolution through Phase 10. Update as implementation progresses.*
