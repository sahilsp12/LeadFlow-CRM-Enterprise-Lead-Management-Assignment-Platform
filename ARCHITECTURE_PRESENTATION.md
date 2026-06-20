# Presentation: Mini Lead Management System (LMS)
## System Architecture & Technical Implementation Overview

This document outlines the contents for a 10-slide presentation explaining the engineering, security, and database choices made in the project.

---

### Slide 1: Project Overview
* **Title**: Mini Lead Management System (LMS)
* **Subtitle**: High-Fidelity Enterprise-Grade Lead Load Balancer
* **Contents**:
  * **Objective**: Technical assessment to build a role-based, concurrency-safe CRM system.
  * **Stack**: Node.js/Express, PostgreSQL (Sequelize ORM), React.js (Vite), Bootstrap CSS, Docker.
  * **Key Features**: Auto-assignment (Least-loaded agent), Audit Event timelines, Dark/Light Mode, RandomUser API Autofill.

---

### Slide 2: System Architecture Layer
* **Title**: Multi-Layer Separation of Concerns
* **Core Flow**:
  * **Client**: React SPA making requests via Axios.
  * **Router**: Express paths validating parameters via `express-validator`.
  * **Middleware**: Security checks (Helmet, CORS, Rate Limiters, XSS Sanitizers), JWT authorization, and central error handlers.
  * **Controller**: Sanitizes requests and returns standard JSON envelopes.
  * **Service**: Orchestrates business logic and external integrations.
  * **Repository**: Directs SQL queries and lock declarations.
  * **Database**: PostgreSQL storing data and enforcing row-level locks.
* **Architecture Diagram**: Mapped in [README.md](file:///d:/CDAC/companies_related/waaneeAI2/Lead%20Management%20System/README.md).

---

### Slide 3: Codebase Folder Structure
* **Title**: Clean MVC + Repository Architecture
* **Key Sections**:
  * **Backend**: Structured into `/config`, `/models`, `/repositories`, `/services`, `/controllers`, `/middleware`, and `/routes`. Keep routes separate from handlers to make testing easier.
  * **Frontend**: Organized into `/api` (Axios clients), `/components` (reusable widgets), `/layouts` (sidebar/navbar drawers), and `/pages` (login, dashboard, settings, grids).

---

### Slide 4: Database Design Decisions
* **Title**: Relational Schema & Performance Indexes
* **Core Decisions**:
  * **UUID vs Integer**: Used UUIDv4 primary keys (`gen_random_uuid()`) to prevent predictable resource crawling attacks and prepare for distributed database scaling.
  * **Soft Deletes (Paranoid)**: Added `deleted_at` timestamp fields on `users` and `leads` tables to prevent physical data loss and support recovery.
  * **Performance Indexing**:
    * Unique index on `users(email)` where `deleted_at IS NULL`.
    * Composite index on `leads(assigned_to, status)` where `deleted_at IS NULL` to speed up agent active-lead counting.

---

### Slide 5: JWT Authentication & Cookie Rotation
* **Title**: Authentication Flow & Session Safety
* **Implementation Details**:
  * **Access Token**: Short-lived (15 mins) bearer header token.
  * **Refresh Token**: Stored in a database table (`refresh_tokens`) and issued via **HttpOnly, Secure, SameSite=Strict cookies** to defend against XSS/CSRF theft.
  * **Refresh Token Rotation (RTR)**: Every time a refresh request is made, the old token is deleted and a new pair is issued, preventing reuse.

---

### Slide 6: Least-Loaded Lead Assignment Logic
* **Title**: Automatic Load Balancing
* **Core Flow**:
  * When a manager creates a lead and omits `assignedTo`, the system queries the agent list.
  * It calculates active lead counts (status is not `'Lost'` and not `'Closed'`).
  * The lead is automatically assigned to the agent with the lowest active count, balancing the sales pipeline.

---

### Slide 7: Concurrency & Lock Handling
* **Title**: Preventing Race Conditions under Load
* **The Challenge**: Parallel creations selecting the same least loaded agent before the first query updates, overloading that agent.
* **The Solution**: PostgreSQL Cooperative Row-Level Locking:
  1. Select agent loads using standard queries (no locks).
  2. Try to lock the candidate agent row using `SELECT ... FOR UPDATE SKIP LOCKED`.
  3. If another parallel transaction holds the lock, skip them and lock the next least loaded agent.
  4. Complete the lead insert and release the lock on commit.

---

### Slide 8: Enterprise Security Features
* **Title**: Defending the API
* **Security Stack**:
  * **Helmet**: Secures HTTP response headers.
  * **CORS**: Handles cookie credentials safely.
  * **Rate Limiter**: Limits general requests (300/15m) and brute-force auth attempts (30/15m).
  * **XSS Sanitizer**: Custom body interceptor that strips HTML/script tags.
  * **Centralized Errors**: Central middleware hides server stack traces from users.

---

### Slide 9: Technical Challenges Faced
* **Title**: Overcoming Database & CSS Conflicts
* **Challenges & Resolutions**:
  * **Postgres Group By Locking**: PostgreSQL throws an error when using `FOR UPDATE` in queries with a `GROUP BY` clause. Solved by separating agent sorting from row locking via `SKIP LOCKED`.
  * **Bootstrap Style Specificity**: Hardcoded `.bg-light` classes overrode our custom body theme-aware backgrounds. Solved by appending specific `[data-theme='dark']` utility override selectors in `index.css`.

---

### Slide 10: Future Scalability Enhancements
* **Title**: Scalability Road Map
* **Key Recommendations**:
  * **Redis Caching**: Cache the dashboard statistics to prevent querying the database every time.
  * **BullMQ Jobs**: Move email alerts and data enrichment to background worker queues to keep the main event loop fast.
  * **WebSockets**: Introduce live updates to push new lead alerts to agents instantly.
