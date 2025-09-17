## Software Requirements Specification (SRS)

### 1. Introduction

- **Project Title**: Doctor Appointment Booking System (MERN)
- **Document Version**: 1.0.0
- **Authors**: Auto-generated based on repository code
- **Last Updated**: {{DATE}}

#### 1.1 Purpose

This SRS describes the functional and non-functional requirements of the Doctor Appointment Booking System built with the MERN stack. It is intended for developers, testers, stakeholders, and maintainers to understand the system capabilities and constraints and to provide a reference for further development and QA.

#### 1.2 Scope

The system enables patients to register/login, browse doctors, and book/manage appointments. Doctors can register, manage their profile, view their appointments, and update appointment statuses. The platform provides REST APIs consumed by a React frontend.

#### 1.3 Definitions, Acronyms, and Abbreviations

- **MERN**: MongoDB, Express.js, React, Node.js
- **JWT**: JSON Web Token for authentication
- **REST**: Representational State Transfer
- **API**: Application Programming Interface

#### 1.4 References

- Repository codebase (this project)
- Tailwind CSS documentation
- Axios documentation

### 2. Overall Description

#### 2.1 Product Perspective

The product is a standalone web application with a React (TypeScript) client and an Express/Node backend with MongoDB. The frontend communicates with the backend via REST APIs with JWT-based authentication.

#### 2.2 Product Functions (High-level)

- Patient and Doctor authentication (registration and login)
- Patient dashboard: browse doctors, search/filter, view upcoming appointments
- Doctor dashboard: view/manage appointments, update statuses
- Appointment lifecycle: create, view, list, cancel, update status (doctor only)
- Doctor directory: list doctors and view doctor details

#### 2.3 User Classes and Characteristics

- **Patient**: Can self-register, search doctors, book/manage own appointments
- **Doctor**: Can self-register (with professional details), view/manage appointments, update appointment statuses
- **Guest/Visitor**: Can browse doctor list (where exposed) and register/login
- **Admin (Future)**: Not implemented; potential role for moderation and reporting

#### 2.4 Operating Environment

- Backend: Node.js/Express, MongoDB
- Frontend: React + TypeScript + Tailwind CSS
- Runtime: Modern browsers (Chrome, Firefox, Edge, Safari), Node.js LTS

#### 2.5 Design and Implementation Constraints

- JWT secret must be configured via environment variable `JWT_SECRET`
- MongoDB connection string configured in environment variables
- CORS enabled for client consumption
- API base URL configurable via `REACT_APP_API_URL` on client

#### 2.6 Assumptions and Dependencies

- Users provide valid contact information
- Doctors provide valid license numbers (server validates uniqueness)
- Network connectivity between client and server

### 3. System Features (Functional Requirements)

#### 3.1 Authentication

1. Users shall be able to register as a patient via `POST /api/auth/register` providing name, email, password, and phone.
2. Users shall be able to register as a doctor via `POST /api/auth/register-doctor` providing personal and professional details (specialization, experience, education, licenseNumber, bio, consultationFee).
3. Users shall be able to login via `POST /api/auth/login` with email and password.
4. The system shall return a JWT on successful registration/login.
5. The system shall provide current user details via `GET /api/auth/me` using the JWT.
6. Passwords shall be hashed using bcrypt before storage.

#### 3.2 Doctor Directory

1. The system shall list all doctors via `GET /api/doctors` with associated user info (name, email, phone).
2. The system shall return a single doctor via `GET /api/doctors/:id`.
3. The frontend shall allow searching by name or specialization and filtering by specialization.

#### 3.3 Appointments (Patient)

1. Authenticated patients shall create an appointment via `POST /api/appointments` with doctorId, date, time, and optional symptoms.
2. The system shall prevent double booking of the same doctor/time slot unless the existing appointment is cancelled.
3. Patients shall fetch their appointments via `GET /api/appointments/patient`.
4. Patients shall cancel their own appointment via `PUT /api/appointments/:id/cancel`.
5. Patients shall view a specific appointment via `GET /api/appointments/:id` if they are the patient.

#### 3.4 Appointments (Doctor)

1. Authenticated doctors shall fetch their appointments via `GET /api/appointments/doctor`.
2. Authenticated doctors shall update appointment status via `PUT /api/appointments/:id/status` (allowed statuses include confirmed, pending, cancelled, completed).
3. Authenticated doctors shall cancel an appointment via `PUT /api/appointments/:id/cancel`.
4. Doctors shall view appointment details via `GET /api/appointments/:id` if they are the assigned doctor.

#### 3.5 Authorization & Access Control

1. The system shall authenticate requests using JWT bearer tokens sent in the `Authorization` header.
2. The system shall restrict doctor-specific endpoints to users with role `doctor`.
3. The system shall ensure users can only access data they own or are authorized to view.

### 4. External Interface Requirements

#### 4.1 User Interfaces (Frontend)

- Login page: email/password with validation, role-based redirect
- Patient Registration: form with validation for email, phone, password strength
- Doctor Registration: detailed form with validation for medical details
- Patient Dashboard: hero banner, quick stats, upcoming appointments, doctor search/filter
- Doctor Dashboard: hero banner, status filters, today/upcoming lists, status update actions
- Components: Navbar, LoadingSpinner

#### 4.2 APIs (Backend)

- Auth
  - `POST /api/auth/register`
  - `POST /api/auth/register-doctor`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- Doctors
  - `GET /api/doctors`
  - `GET /api/doctors/:id`
- Appointments
  - `POST /api/appointments`
  - `GET /api/appointments/patient`
  - `GET /api/appointments/doctor`
  - `PUT /api/appointments/:id/status`
  - `PUT /api/appointments/:id/cancel`
  - `GET /api/appointments/:id`
- Health & Root
  - `GET /api/health`
  - `GET /`

#### 4.3 Data Models

- User
  - Fields: name, email (unique), password (hashed), role ('patient' | 'doctor'), phone
- Doctor
  - Fields: userId (ref User), specialization, experience, education, licenseNumber (unique), bio, consultationFee, availability[]
- Appointment
  - Fields: patientId (ref User), doctorId (ref Doctor), date (ISO), time (string), symptoms (string), status ('pending' | 'confirmed' | 'cancelled' | 'completed'), notes

### 5. Non-Functional Requirements

#### 5.1 Security

- JWT authentication for protected endpoints
- Passwords hashed with bcrypt
- Role-based authorization middleware
- CORS configuration for client access

#### 5.2 Performance

- API should respond within 500ms under normal load
- Pagination and query optimization can be introduced for large datasets (future)

#### 5.3 Reliability & Availability

- API health endpoint `/api/health` for monitoring
- Graceful shutdown on SIGTERM/SIGINT

#### 5.4 Usability

- Responsive UI using Tailwind
- Form validation with helpful error messages
- Role-based redirects post-login

#### 5.5 Maintainability

- Typed frontend with TypeScript
- Modular APIs with separation of concerns (routes, middleware, models)
- Centralized API client with Axios interceptors

#### 5.6 Portability

- Client runs in modern browsers
- Server runs on Node.js LTS and connects to MongoDB-compatible instances

### 6. System Architecture

- Client: React (TypeScript) + Tailwind CSS; uses `AuthContext` for auth state, `services/api.ts` for API access
- Server: Express.js routes for auth, doctors, appointments; middleware for auth; MongoDB models for persistence
- Data flow: Client -> Axios -> REST -> Express -> MongoDB; JWT secures protected routes

### 7. Constraints & Configurations

- Environment variables (examples):
  - Server: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV`
  - Client: `REACT_APP_API_URL`
- Build dependencies and versions defined in `package.json` files

### 8. Error Handling & Logging

- Server logs each request method/path with timestamp
- Global error handler returns standardized JSON structure
- Client interceptor redirects to `/login` on 401 and clears local storage

### 9. Acceptance Criteria (Samples)

- Patient can register and is automatically authenticated; `localStorage` stores token and user
- Doctor can register with valid license number and see doctor dashboard upon login
- Patient can view doctor list, filter by specialization, and create an appointment in an open slot
- Doctor can view their appointments and update status to confirmed/completed/cancelled
- Unauthorized user cannot access protected endpoints (receives 401/403)

### 10. Future Enhancements (Out of Scope)

- Admin role and admin dashboard
- Payment integration for consultation fees
- Appointment reminders (email/SMS)
- Doctor availability calendar and slot generation
- Reviews/ratings for doctors
- Internationalization (i18n)

---

Note: This SRS reflects the current repository implementation. Update this document when adding new features or changing APIs.
