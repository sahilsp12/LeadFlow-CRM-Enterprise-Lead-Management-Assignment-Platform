# AI Usage Disclosure

This document discloses the use of AI assistant tools during the development of the Mini Lead Management System, as required by the technical assessment evaluation guidelines.

---

## 1. AI Assistant Details
* **AI Tool Used**: Antigravity (developed by Google DeepMind)
* **Model**: Gemini 3.5 Flash (High)

---

## 2. Sourced and Scaffolded Components
The AI assistant was used to scaffold boilerplate structures, translate design tokens, and draft base relational models:

1. **Relational Schema Boilerplate**:
   * Initial drafting of the Sequelize schemas for `User`, `Lead`, `RefreshToken`, and `ActivityLog` incorporating UUID primary keys.
2. **REST Endpoint Scaffolding**:
   * Boilerplate route definitions and controller mapping structures for authentication, lead logs, and dashboard metrics.
3. **Frontend Interceptor Logic**:
   * Scaffolding the Axios instance and queue interceptor pattern to support automatic JWT refresh token rotation.
4. **Theme styling tokens**:
   * Scaffolding CSS variables mapping dark and light mode color templates in `index.css`.

---

## 3. Manual Implementations, Debugging & Custom Logic
While the AI assisted in code scaffolding, the following components were engineered, customized, and debugged manually to meet production-level standards:

1. **Cooperative Row Locking (Bypassing PostgreSQL Limitations)**:
   * **Issue**: The initial single-query auto-assignment logic combined a `COUNT` aggregator, a `GROUP BY u.id` clause, and a `FOR UPDATE` lock. This threw a PostgreSQL error: `FOR UPDATE is not allowed with GROUP BY clause`.
   * **Fix**: Manually refactored `findLeastLoadedAgent()` in [LeadRepository.js](file:///d:/CDAC/companies_related/waaneeAI2/Lead%20Management%20System/backend/src/repositories/LeadRepository.js) into a two-stage cooperative lock:
     1. Query agent loads using standard SQL grouping (no lock).
     2. Loop through candidate agents (least loaded first) and acquire a row lock using `FOR UPDATE SKIP LOCKED`. This prevented race conditions under concurrent requests without throwing database errors.
2. **Dark Mode Bootstrap Styles Override**:
   * **Issue**: Hardcoded Bootstrap utility classes (like `.bg-light`, `.text-dark`, and `.card`) in layouts overrode the custom dark theme background colors.
   * **Fix**: Added global override blocks in [index.css](file:///d:/CDAC/companies_related/waaneeAI2/Lead%20Management%20System/frontend/src/index.css) nested under `[data-theme='dark']` to intercept and force these classes to use the appropriate theme-aware CSS variables.
3. **Security Access Boundaries on Logs**:
   * Manually added authorization checks inside `LogController.js` to ensure `AGENT` roles can only view logs associated with leads assigned to their own user ID.
4. **Local Database SSL Handshake Bypass**:
   * Added the `DB_SSL` environment variable configuration in `database.js` to bypass mandatory SSL handshakes during local container running (`NODE_ENV=production` in Docker), while keeping it configurable for cloud deployments.
