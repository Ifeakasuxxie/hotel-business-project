# API Specification — The Kings Hotel

> Draft specification. APIs will be implemented progressively from Phase 3 onward.

---

## Phase 3 Implementation Status (Scaffolding)

All route groups below are **scaffolded** in `src/app/api/*`. Every endpoint is wired through the shared error handler and (where relevant) Zod validation, but **returns `501 NOT_IMPLEMENTED`** until Phase 4+, when the corresponding service stub is filled in. The exception is `GET /api/health`.

### Live routes (Phase 3)

| Method | Route | Validation | Service stub |
|--------|-------|-----------|--------------|
| GET | `/api/health` | — | returns `{ status: "ok" }` |
| POST | `/api/auth/register` | `registerUserSchema` | `authService.register` |
| POST | `/api/auth/login` | `loginSchema` | `authService.login` |
| POST | `/api/auth/logout` | — | `authService.logout` |
| GET | `/api/auth/me` | — | `authService.getCurrentUser` |
| GET/POST | `/api/users` | `registerUserSchema` | `userService.list/create` |
| GET/PATCH/DELETE | `/api/users/[id]` | — | `userService.getById/update/deactivate` |
| GET | `/api/rooms` | — | `roomService.listAvailable` |
| GET | `/api/rooms/[id]` | — | `roomService.getById` |
| GET/POST | `/api/bookings` | `createBookingSchema` | `bookingService.*` |
| GET/PATCH | `/api/bookings/[id]` | — | `bookingService.*` |
| POST | `/api/payments` | `createPaymentSchema` | `paymentService.initialize` |
| GET | `/api/payments/[id]` | — | `paymentService.verify` |
| GET/POST | `/api/reviews` | `createReviewSchema` | `reviewService.*` |
| PATCH | `/api/reviews/[id]` | — | `reviewService.moderate` |
| GET | `/api/restaurant/menu` | — | `restaurantService.listMenu` |
| GET | `/api/restaurant/menu/[id]` | — | `restaurantService.getItem` |
| GET/POST | `/api/restaurant/orders` | `createRestaurantOrderSchema` | `restaurantService.*` |
| GET | `/api/restaurant/orders/[id]` | — | `restaurantService.getOrder` |
| POST | `/api/reservations/table` | `tableReservationSchema` | `reservationService.createTable` |
| POST | `/api/reservations/pool` | `poolReservationSchema` | `reservationService.createPool` |
| POST | `/api/reservations/event` | `eventReservationSchema` | `reservationService.createEvent` |
| POST | `/api/contact` | `contactMessageSchema` | (inline TODO) |

### Implemented envelope (deviates from earlier draft)

The draft below used nested `{ error: { code, message, details } }`. The implementation uses a **flat envelope**:

```jsonc
// Success
{ "success": true, "data": { ... }, "message": "optional" }

// Failure
{ "success": false, "error": "Human readable message", "code": "VALIDATION_ERROR", "details": { ... } }
```

Pagination is **offset-based** (not cursor-based):

```jsonc
{ "success": true, "data": { "items": [], "total": 0, "page": 1, "pageSize": 20, "totalPages": 0 } }
```

Error codes implemented: `VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `UNAUTHORIZED`, `FORBIDDEN`, `DATABASE_ERROR`, `NOT_IMPLEMENTED`, `INTERNAL_ERROR`. Validation failures surface Zod's flattened field errors under `details`.

> Endpoints, auth flow, rate limits, webhooks, SSE, and the AI concierge below remain the **target** for Phases 4–10 and are still drafts.

---

## Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:3000/api` |
| Staging | `https://staging.thekingshotel.ng/api` |
| Production | `https://thekingshotel.ng/api` |

---

## Authentication

All API requests (except public endpoints) require a JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

### Token Lifecycle
- **Access Token**: 15-minute TTL
- **Refresh Token**: 7-day TTL (stored in Redis)
- **Issued at**: Login or registration

---

## Rate Limiting

| Endpoint Group | Limit | Window |
|----------------|-------|--------|
| Public (rooms, services) | 100 req/min | 1 minute |
| Booking | 3 req/min per IP | 1 minute |
| Contact | 5 req/min per IP | 1 minute |
| Auth (login, register) | 10 req/min per IP | 1 minute |
| AI Concierge | 20 req/min per user | 1 minute |

Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Idempotency

All POST/PUT/PATCH requests that create or modify resources support idempotency.

**Request Header**: `Idempotency-Key: <uuid>`
**Response**: If key already processed, returns cached response with `200 OK`.
**TTL**: 24 hours from first request.

---

## Endpoints

### Rooms

#### `GET /api/rooms`

List all rooms with optional filters.

**Query Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `checkIn` | date | Filter by availability |
| `checkOut` | date | Filter by availability |
| `capacity` | int | Minimum guest capacity |
| `sort` | string | `price_asc`, `price_desc`, `popularity` |

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Deluxe Room",
      "description": "Elegantly appointed room...",
      "price": 65000,
      "currency": "NGN",
      "capacity": 2,
      "bed": "King-Size Bed",
      "features": ["Smart TV", "Free Wi-Fi"],
      "images": ["https://cdn.thekingshotel.ng/rooms/deluxe-1.jpg"],
      "available": true
    }
  ],
  "meta": {
    "total": 4,
    "available": 3
  }
}
```

#### `GET /api/rooms/:id`

Get single room details.

**Response**: Single room object with availability calendar.

#### `GET /api/rooms/:id/availability`

Check specific room availability.

**Query Parameters**: `checkIn`, `checkOut`

**Response**:
```json
{
  "roomId": "uuid",
  "available": true,
  "pricePerNight": 65000,
  "totalPrice": 130000,
  "nights": 2,
  "blockedDates": ["2026-08-15", "2026-08-16"]
}
```

### Bookings

#### `POST /api/bookings`

Create a new booking.

**Request**:
```json
{
  "roomId": "uuid",
  "checkIn": "2026-09-01",
  "checkOut": "2026-09-03",
  "guests": 2,
  "guestName": "John Doe",
  "guestEmail": "john@example.com",
  "guestPhone": "+2348000000000",
  "specialRequests": "Late check-in preferred"
}
```

**Headers**: `Idempotency-Key: <uuid>`

**Response** `201 Created`:
```json
{
  "id": "uuid",
  "status": "pending",
  "room": { "id": "uuid", "title": "Deluxe Room" },
  "checkIn": "2026-09-01",
  "checkOut": "2026-09-03",
  "nights": 2,
  "guests": 2,
  "totalAmount": 130000,
  "currency": "NGN",
  "createdAt": "2026-07-30T10:00:00Z"
}
```

**Error** `409 Conflict`: Room not available for requested dates.
**Error** `422 Unprocessable Entity`: Invalid dates or capacity exceeded.

#### `GET /api/bookings`

List user's bookings (requires auth).

**Query Parameters**: `status` (pending, confirmed, cancelled, completed), `page`, `limit`

#### `GET /api/bookings/:id`

Get booking details.

#### `PATCH /api/bookings/:id`

Modify booking dates. Only allowed for pending/confirmed bookings.

#### `DELETE /api/bookings/:id`

Cancel booking.

### Payments

#### `POST /api/payments/initialize`

Initialize a payment with Paystack.

**Request**:
```json
{
  "bookingId": "uuid",
  "email": "john@example.com",
  "amount": 130000,
  "currency": "NGN"
}
```

**Response**:
```json
{
  "authorizationUrl": "https://checkout.paystack.com/...",
  "reference": "paystack_ref",
  "status": "pending"
}
```

#### `GET /api/payments/verify?reference=...`

Verify payment after redirect from Paystack.

#### `POST /api/webhooks/paystack`

Webhook endpoint for Paystack payment events.

**Events**: `charge.success`, `charge.failed`

### Auth

#### `POST /api/auth/register`

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+2348000000000",
  "password": "securePassword123"
}
```

**Response**: `{ "user": {...}, "accessToken": "...", "refreshToken": "..." }`

#### `POST /api/auth/login`

**Request**: `{ "email": "...", "password": "..." }`
**Response**: `{ "user": {...}, "accessToken": "...", "refreshToken": "..." }`

#### `POST /api/auth/refresh`

**Request**: `{ "refreshToken": "..." }`
**Response**: `{ "accessToken": "...", "refreshToken": "..." }`

#### `POST /api/auth/logout`

Invalidate current session.

### Hotel Services

#### `POST /api/services/room-service`

Request room service.

**Request**: `{ "bookingId": "uuid", "items": [...], "notes": "..." }`

#### `POST /api/services/laundry`

Request laundry service.

#### `POST /api/services/housekeeping`

Request housekeeping.

### Notifications

#### `GET /api/notifications/stream`

SSE endpoint for real-time notifications.

```
event: booking.confirmed
data: {"bookingId": "uuid", "message": "Your booking has been confirmed"}

event: payment.received
data: {"bookingId": "uuid", "amount": 130000}
```

### AI Concierge

#### `POST /api/concierge/chat`

Send a message to the AI concierge.

**Request**:
```json
{
  "message": "What time does the pool open?",
  "sessionId": "uuid"
}
```

**Response** (streamed via SSE):
```
event: token
data: "Our pool opens at"

event: token
data: " 7:00 AM daily."

event: done
data: {}
```

---

## Error Format

All errors follow a consistent structure:

```json
{
  "error": {
    "code": "ROOM_NOT_AVAILABLE",
    "message": "The requested room is not available for the selected dates.",
    "details": {
      "roomId": "uuid",
      "conflictingDates": ["2026-09-01"]
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 422 | Invalid request body |
| `ROOM_NOT_AVAILABLE` | 409 | Room booked for requested dates |
| `BOOKING_NOT_FOUND` | 404 | Booking ID does not exist |
| `PAYMENT_FAILED` | 402 | Payment gateway declined |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `RATE_LIMITED` | 429 | Too many requests |
| `IDEMPOTENCY_CONFLICT` | 409 | Request with same key in progress |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Pagination

List endpoints support cursor-based pagination.

**Request**: `?cursor=uuid&limit=20`
**Response**:
```json
{
  "data": [...],
  "meta": {
    "nextCursor": "uuid",
    "hasMore": true
  }
}
```

---

## Versioning

API is versioned via URL prefix: `/api/v1/rooms`. Breaking changes introduce a new version. Minor changes are backward-compatible within the same version.

---

*This specification is a draft. Endpoints will be implemented incrementally as each phase adds backend services.*
