# EventHub - Ticket Booking System

A web-based event ticket booking platform developed for the **ITUE301 Advanced Web Development Frameworks** practical examination.

---

## Tech Stack

- **Frontend:** React (Vite) & JavaScript
- **Routing & State:** React Router, React.lazy, Suspense, AuthContext
- **Backend:** Node.js & Express.js REST API
- **Storage Mode (Task 3):** Decoupled In-Memory Store *(Temporary standalone phase while Atlas connectivity is prepared)*
- **Styling:** Vanilla CSS (Dark Glassmorphism)

---

## Project Structure

```text
EventHub/
├── frontend/                 # React + Vite frontend application (Tasks 1 & 2)
│   ├── src/
│   │   ├── components/       # EventCard, ProtectedRoute
│   │   ├── context/          # AuthContext (attendee, token, role)
│   │   ├── pages/            # EventsPage, LoginPage, MyTicketsPage, OrganizerPanel
│   │   ├── App.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── backend/                  # Express REST API (Task 3)
│   ├── data/
│   │   └── inMemoryStore.js  # Temporary in-memory repository (Events, Attendees, Tickets)
│   ├── middleware/
│   │   ├── requestLogger.js  # Global logger: [METHOD] [PATH] [TIMESTAMP]
│   │   ├── authGuard.js      # Bearer JWT validator (401 on missing/invalid)
│   │   └── errorHandler.js   # Global structured JSON error handler
│   ├── routes/
│   │   ├── authRoutes.js     # POST /api/v1/auth/login, /register, GET /me
│   │   ├── eventRoutes.js    # GET /api/v1/events (Public), GET /:id
│   │   └── ticketRoutes.js   # POST /tickets (201/400), GET /my, PATCH /:id/status
│   ├── .env.example          # Safe template for PORT and JWT_SECRET
│   ├── package.json          # Express, bcryptjs, jsonwebtoken, cors, dotenv
│   └── server.js             # Express application entry point
├── .env.example
├── .gitignore
└── README.md
```

---

## Backend REST API Endpoints (`/api/v1`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/auth/login` | Public | Validates credentials, returns JWT Bearer token |
| **POST** | `/api/v1/auth/register` | Public | Registers a new attendee / organizer |
| **GET** | `/api/v1/events` | Public | Retrieves all events with current ticket quota |
| **GET** | `/api/v1/events/:id` | Public | Retrieves a single event by ID |
| **POST** | `/api/v1/tickets` | Protected | Books ticket(s) with atomic stock decrement |
| **GET** | `/api/v1/tickets/my` | Protected | Returns authenticated attendee's booked tickets |
| **PATCH** | `/api/v1/tickets/:id/status` | Protected | Updates ticket status (`booked`/`cancelled`/`used`) with inventory consistency |

---

## Pre-Seeded Development Credentials

For testing and examination viva demonstration, the in-memory store is pre-seeded with:

- **Attendee Account:**
  - **Email:** `attendee@charusat.edu.in`
  - **Password:** `Password123!`
  - **Role:** `attendee`
- **Organizer Account:**
  - **Email:** `organizer@charusat.edu.in`
  - **Password:** `Password123!`
  - **Role:** `organizer`
- **Second Attendee (for authorization testing):**
  - **Email:** `attendee2@charusat.edu.in`
  - **Password:** `Password123!`
  - **Role:** `attendee`

*(Passwords are stored as bcrypt hashes and are never exposed in API responses).*

---

## Installation & Startup

### 1. Backend Setup
```bash
cd backend
npm install
npm start
# Or for automatic reload during development:
npm run dev
```
The server will run on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The client application will run on `http://localhost:5173`.

---

## Postman / Thunder Client Testing Guide

### 1. Authenticate & Obtain JWT Token
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/v1/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "email": "attendee@charusat.edu.in",
    "password": "Password123!"
  }
  ```
- **Expected Status:** `200 OK`
- **Response:** Copy the `token` string for subsequent protected requests.

---

### 2. Get All Events (Public)
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/v1/events`
- **Expected Status:** `200 OK`
- Notice `evt-101` has `ticketsAvailable: 45`, while `evt-103` has `ticketsAvailable: 0` (Sold Out).

---

### 3. Book Tickets Successfully (201 Created)
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/v1/tickets`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <YOUR_COPIED_TOKEN>`
- **Body:**
  ```json
  {
    "eventId": "evt-101",
    "quantity": 2
  }
  ```
- **Expected Status:** `201 Created`
- **Verification:** Notice `remainingEventStock` becomes `43`.

---

### 4. Overbooking / Insufficient Stock (400 Bad Request)
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/v1/tickets`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <YOUR_COPIED_TOKEN>`
- **Body:**
  ```json
  {
    "eventId": "evt-101",
    "quantity": 100
  }
  ```
- **Expected Status:** `400 Bad Request`
- **Response:**
  ```json
  {
    "success": false,
    "message": "Insufficient stock available. Only 43 ticket(s) remaining for \"TechNova Global Hackathon 2026\".",
    "ticketsAvailable": 43
  }
  ```

---

### 5. Missing / Invalid Token (401 Unauthorized)
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/v1/tickets`
- **Headers:** `Content-Type: application/json` *(No Authorization header)*
- **Body:** `{"eventId": "evt-101", "quantity": 1}`
- **Expected Status:** `401 Unauthorized`

---

### 6. Get My Booked Tickets
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/v1/tickets/my`
- **Headers:** `Authorization: Bearer <YOUR_COPIED_TOKEN>`
- **Expected Status:** `200 OK`
- **Response:** Returns only the authenticated attendee's tickets with populated event and attendee details.

---

### 7. Cancel Ticket & Restore Stock
- **Method:** `PATCH`
- **URL:** `http://localhost:5000/api/v1/tickets/<TICKET_ID>/status`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <YOUR_COPIED_TOKEN>`
- **Body:**
  ```json
  {
    "status": "cancelled"
  }
  ```
- **Expected Status:** `200 OK`
- **Verification:** Inventory increases back by the booked quantity (`+2` -> `45`). Sending a duplicate cancel request remains idempotent and will not double-increment the stock.

---

### 8. Attempt Modifying Another Attendee's Ticket (403 Forbidden)
- Login as `attendee2@charusat.edu.in` to obtain a different token.
- Attempt to cancel a ticket belonging to `attendee@charusat.edu.in`.
- **Expected Status:** `403 Forbidden` (`"Access forbidden. You are not authorized to modify another attendee's ticket."`).

---

## Known Limitations of In-Memory Storage (Task 3 Phase)
1. **Non-Persistent:** Data resets to the initial seed array whenever the Express process restarts.
2. **Single-Instance:** Suitable for single-process local development and testing; not distributed across multiple server clusters.
3. **Mongoose Independence:** Mongoose schemas and MongoDB Atlas integration are preserved and scheduled for the next task phase without breaking the existing REST API contracts.
