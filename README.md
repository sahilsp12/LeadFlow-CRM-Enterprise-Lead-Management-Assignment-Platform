# Lead Management System (LMS)

An enterprise-grade, production-ready Mini Lead Management System. Built with **Node.js/Express** and **Sequelize ORM (PostgreSQL)** on the backend, and **React + Vite** with **Bootstrap CSS** on the frontend. Containerized fully using **Docker**.

---

## Architecture Overview

This project implements a clean separation of concerns:
1. **Routing Layer**: Validates HTTP payloads and checks role permissions using middleware.
2. **Controller Layer**: Parses request variables and returns formatted JSON envelopes.
3. **Service Layer**: Houses core business workflows (e.g. least-loaded agent assignment, external user suggestions).
4. **Repository Layer**: Encapsulates raw database queries.
5. **Database (PostgreSQL)**: Enforces referential integrity, UUID structures, soft deletes, and locks.

### ER Diagram
```mermaid
erDiagram
    USERS {
        uuid id PK
        string name
        string email UK
        string password
        enum role "ADMIN | MANAGER | AGENT"
        timestamp deleted_at
        timestamp created_at
        timestamp updated_at
    }
    LEADS {
        uuid id PK
        string name
        string email
        string phone
        string source
        enum status "New | Contacted | Qualified | Lost | Closed"
        uuid assigned_to FK
        text notes
        uuid created_by FK
        timestamp deleted_at
        timestamp created_at
        timestamp updated_at
    }
    REFRESH_TOKENS {
        uuid id PK
        uuid user_id FK
        string token
        timestamp expires_at
        timestamp created_at
    }
    ACTIVITY_LOGS {
        uuid id PK
        string action
        uuid lead_id FK
        uuid user_id FK
        text description
        timestamp created_at
    }

    USERS ||--o{ LEADS : "assigned/created"
    USERS ||--o{ REFRESH_TOKENS : "owns"
    USERS ||--o{ ACTIVITY_LOGS : "performs"
    LEADS ||--o{ ACTIVITY_LOGS : "logs"
```

### API Flow Diagram
```mermaid
sequenceDiagram
    autonumber
    Client ->> Security Middleware: HTTP Request + Bearer JWT
    Security Middleware ->> Security Middleware: Check XSS & Rate Limits
    Security Middleware ->> Auth Middleware: Verify Token
    Auth Middleware ->> Role Middleware: Verify Permissions
    Role Middleware ->> Controllers: Handle Request
    Controllers ->> Services: Invoke Business Rules
    Services ->> Database: DB Transaction with Locks
    Database -->> Client: Standardized Success Envelope
```

### Auto-Assignment Concurrency Flow
```mermaid
sequenceDiagram
    autonumber
    Manager ->> LeadService: Create Lead (assignedTo = NULL)
    LeadService ->> Database: Begin Transaction
    LeadService ->> Database: SELECT Agent FOR UPDATE (Row Lock)
    Note over LeadService, Database: Agent Alpha locked. Other parallel assignments block.
    Database -->> LeadService: Agent Alpha (fewest active leads: 3)
    LeadService ->> Database: INSERT Lead (assigned_to = Agent Alpha)
    LeadService ->> Database: Commit Transaction
    Note over Database: Agent Alpha lock released. Active count is now 4.
```

---

## Directory Folder Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/          # Database & pool settings
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, Role, RateLimiter, Security, Errors
│   │   ├── models/          # Sequelize schema models (User, Lead, RefreshToken, ActivityLog)
│   │   ├── repositories/    # Encapsulated DB queries & FOR UPDATE locks
│   │   ├── routes/          # REST endpoints
│   │   ├── services/        # Core business workflows
│   │   ├── swagger/         # OpenAPI configuration
│   │   └── app.js           # Express app setup
│   ├── Dockerfile
│   ├── api_collection.json # Importable Postman Collection
│   ├── schema.sql           # Database schema SQL
│   ├── server.js            # App listener & db synchronization
│   └── test_concurrency.js  # Parallel assignment integration test
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios instance & token refresh interceptors
│   │   ├── components/      # Reusable UI (Table, Pagination, Modal, Input, ErrorBoundary)
│   │   ├── context/         # AuthContext state manager
│   │   ├── layouts/         # Sidebar + Navbar shells
│   │   ├── pages/           # Login, Dashboard, Lead CRUD, Log lists, Users directory
│   │   ├── routes/          # Router & ProtectedRoute guards
│   │   ├── App.jsx          # Route declarations
│   │   ├── index.css        # Foundational CSS styling
│   │   └── main.jsx         # App entry point
│   ├── Dockerfile
│   ├── nginx.conf           # SPA Nginx redirection rules
│   └── vite.config.js       # Vite React server config
│
└── docker-compose.yml       # Unified container setup
```

---

## Environment Variables Configuration

Create a `.env` in the `backend/` directory based on the following:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgres://postgres:postgres@localhost:5432/lead_management_db
JWT_SECRET=supersecretjwtkeyforaccess123!@#
JWT_REFRESH_SECRET=supersecretjwtkeyforrefresh456!@#
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLIENT_URL=http://localhost:5173
RANDOMUSER_API=https://randomuser.me/api/
```

---

## Run Locally (Step-by-step Setup)

### Prerequisite
Ensure you have **PostgreSQL** running locally and a database named `lead_management_db` created:
```sql
CREATE DATABASE lead_management_db;
```

### 1. Boot Backend
```bash
cd backend
npm install
npm run dev
```
*The backend automatically synchronizes Sequelize schemas and seeds default credentials on startup.*

### 2. Boot Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit http://localhost:5173 to load the client dashboard portal.

### 3. Run Concurrency and Transaction Locking Test
To run the automated script that simulates 12 simultaneous lead creations to check locking accuracy:
```bash
cd backend
npm run test:concurrency
```

---

## Run Using Docker Containerization

To build and run the database, backend services, and Nginx frontend in a unified cluster:
```bash
docker-compose up --build
```
- Frontend portal will be hosted at: http://localhost
- Backend endpoints will be hosted at: http://localhost:5000
- API Swagger Docs will be available at: http://localhost:5000/api/docs

---

## Demo Credentials (Auto-Seeded)

- **Admin**: `admin@waanee.ai` / `admin123`
- **Manager**: `manager@waanee.ai` / `manager123`
- **Agent**: `agent@waanee.ai` / `agent123`

---

## System Design Assumptions & Tradeoffs

1. **Active Lead Definition**: An "Active Lead" is defined as any record whose status is NOT `Lost` and NOT `Closed`. This status metric counts towards the load calculation for automatic assignments.
2. **PostgreSQL Row Locking vs Serializable Isolation**: Using `SELECT FOR UPDATE` on agent lookups locks the agent record, serializing parallel assignments. This prevents race conditions under high parallel load without throwing complex serialization rollback errors to the clients.
3. **Rotational Refresh Tokens**: Refresh token rotation prevents session hijacking. When a user requests a new access token, a new refresh token is issued, and the old token is invalidated.

---

## Deployment Architecture

- **Frontend Hosting**: Build static SPA (`npm run build`) and host on **Vercel** or **Netlify**. Configure a rewrite rule (`_redirects` or `vercel.json`) to forward all paths back to `index.html` to prevent 404s.
- **Backend hosting**: Run the Express Docker container on **Render** or **Railway**.
- **PostgreSQL Database**: Use a cloud relational service like **Supabase PostgreSQL** or **AWS RDS PostgreSQL**.

---

## PPT Presentation Slide Content (10 Slides)

### Slide 1: Title & Overview
- **Title**: Mini Lead Management System (LMS)
- **Subtitle**: Enterprise-Grade Architecture and Design Presentation
- **Details**: Full stack modular architecture built with Node.js/Express and React.

### Slide 2: Folder Structure & Clean Code
- **Key Point**: Modular division of responsibilities (Router, Controller, Service, Repository, DB).
- **Benefit**: Decouples business rules from the HTTP transport layer, enhancing testability.

### Slide 3: Database Design (UUID + Paranoid)
- **Key Point**: Swapping standard serial keys with UUIDv4 (via `gen_random_uuid()`).
- **Benefit**: Secure resource endpoints, prevent predictable URL attacks, and support soft deletes.

### Slide 4: Concurrency-Safe Auto Assignment
- **Key Point**: Least-loaded agent assignment using database-level locking (`SELECT ... FOR UPDATE`).
- **Benefit**: Prevents multiple parallel leads from assigning to the same agent during simultaneous requests.

### Slide 5: Authentication Security & Session Rotation
- **Key Point**: Short-lived access tokens (15m) + longer refresh tokens (7d) stored in HttpOnly, SameSite=Strict cookies.
- **Benefit**: Defends against XSS and CSRF token thefts, with rotation invalidating old sessions.

### Slide 6: API Standardizations & Middlewares
- **Key Point**: Helmet HTTP headers, CORS configurations, rate limiters, custom body XSS sanitizers.
- **Benefit**: Uniform success and error JSON envelopes and robust protection.

### Slide 7: Third-Party Enrichments
- **Key Point**: Asynchronous connections to `https://randomuser.me/api/` to autofill creation fields.
- **Benefit**: Seeds realistic data instantly, streamlining manual entries.

### Slide 8: Modern Responsive UI (Bootstrap + Outfit)
- **Key Point**: Styled using Outfit/Inter typography, card translations, and full desktop/mobile responsive grids.
- **Benefit**: High fidelity UI design providing role-based Sidebar navigation panels.

### Slide 9: Observability, Logging & Docker
- **Key Point**: Detailed system-wide audit trails, lead timeline feeds, and multi-stage containerizations.
- **Benefit**: Ready for cluster deployment on Docker Swarm / Kubernetes.

### Slide 10: Future Scalability Recommendations
- **Redis Cache**: Introduce Redis for dashboard statistic caching.
- **BullMQ Workers**: Offload notification tasks to async workers.
- **WebSockets**: Deliver real-time status alerts.
