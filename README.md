# 🐱 PetChoice – Cat Breed Management System

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-22.x-green?logo=node.js)
![Express](https://img.shields.io/badge/Express.js-Backend-black?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue?logo=postgresql)
![Sequelize](https://img.shields.io/badge/Sequelize-ORM-blue?logo=sequelize)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-purple?logo=bootstrap)
![EJS](https://img.shields.io/badge/EJS-Template-yellow)
![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)
![License](https://img.shields.io/badge/License-Educational-red)

**WEB700 - Web Programming**

**Business Information Technology**

**Seneca Polytechnic**

Summer 2026

### 🔗 [Live Demo](https://petchoice-part3.vercel.app/)

</div>

---

# 📚 Table of Contents

- Project Overview
- Live Demo
- Project Objectives
- Application Features
- Technology Stack
- System Architecture
- Database Design
- Authentication & Security
- REST API
- Installation
- Environment Variables
- Default User Accounts
- Project Structure
- Application Pages
- CRUD Operations
- Security Features
- Testing
- Future Enhancements
- Authors

---

# 📖 Project Overview

PetChoice is a full-stack web application that enables users to discover, browse, search, and manage information about cat breeds behind secure member accounts.

The application was developed as the final project for **WEB700 – Web Programming** at **Seneca Polytechnic**.

The goal of the project is to demonstrate practical knowledge of:

- Full Stack Web Development
- RESTful API Design
- Database Management
- Authentication & Authorization
- Secure Web Programming (CSRF protection, rate limiting, OTP-based account recovery)
- MVC Design Pattern
- CRUD Operations
- Responsive Web Design

The application integrates PostgreSQL with Node.js using Sequelize ORM and provides a secure authentication system — registration, login/logout, self-service password changes, OTP-based password recovery, and role-based access control — backed by Postgres-persisted sessions.

---

# 🚀 Live Demo

The application is deployed and publicly accessible on Vercel:

🔗 **[https://petchoice-part3.vercel.app/](https://petchoice-part3.vercel.app/)**

Create a free account, or use the [Default User Accounts](#-default-user-accounts) below to log in and explore both Administrator and Viewer roles.

---

# 🎯 Project Objectives

The primary objectives of PetChoice are:

- Build a complete CRUD application
- Connect to a PostgreSQL database
- Implement Sequelize ORM
- Build REST API endpoints
- Develop a responsive UI using Bootstrap
- Secure the application using authentication
- Implement role-based authorization
- Protect administrator routes
- Restrict the breed catalog to registered, logged-in users
- Provide self-service account recovery via a one-time verification code
- Harden the application against CSRF and brute-force attacks
- Follow modern Node.js development practices

---

# ✨ Application Features

## 🐱 Breed Catalog

Once logged in, users can:

- Browse all available cat breeds
- View detailed breed information
- Search breeds
- Sort breeds alphabetically
- Filter breeds by origin
- View breed characteristics

Each breed displays:

- Breed Name
- Image
- Origin
- Description
- Temperament
- Lifespan
- Weight
- Coat Type
- Grooming Level
- Tags

The catalog, search, and breed detail pages all require an active login — guests are redirected to the login page.

---

## ✏ Administrator Features

Administrator users can:

- Register, login, logout
- Browse and search breeds
- Add new breeds
- Edit existing breeds
- Delete breeds
- Change their own password
- Recover their password via a one-time email code
- View the Admin Dashboard (total breeds, total users, admins vs. viewers, top breed origins, recently added breeds, and a full user account list)

---

## 👤 Viewer Features

Viewer users can:

- Register, login, logout
- Browse breeds
- Search breeds
- View breed information
- Change their own password
- Recover their password via a one-time email code

Viewer users cannot:

- Add breeds
- Edit breeds
- Delete breeds
- Access the Admin Dashboard

---

## 🔐 Account & Security Features

- **Register** — anyone can create a free account (name, email, optional phone, password). New accounts are always created with the Viewer role; Administrator accounts are seeded, not self-assigned.
- **Change Password** — available to both roles, requires the current password before setting a new one.
- **Forgot Password (OTP)** — a 3-step, email-based one-time code flow: request a code, verify the 6-digit code, then set a new password. Codes expire after 10 minutes and are stored bcrypt-hashed, never in plaintext.
- **CSRF Protection** — every form submits a session-bound token, verified on the server before any state-changing request is processed.
- **Rate Limiting** — login, registration, and OTP requests are throttled to blunt brute-force and spam attempts.

---

# 💻 Technology Stack

## Backend

- Node.js
- Express.js
- Sequelize ORM
- PostgreSQL (Neon)

## Frontend

- HTML5
- CSS3
- Bootstrap 5
- EJS
- JavaScript

## Security

- bcrypt.js — password & OTP hashing
- Express Session, backed by `connect-pg-simple` (Postgres-persisted sessions)
- Helmet — HTTP security headers, including an active Content Security Policy
- express-rate-limit — brute-force / spam throttling on auth routes
- Node's built-in `crypto` module — one-time code generation
- nodemailer — optional real email delivery for OTP codes
- dotenv

## Development Tools

- Git
- GitHub
- VS Code
- Postman
- Neon PostgreSQL
- Vercel

---

# 🏗 System Architecture

```
Browser
      │
      ▼
Express Server
      │
      ▼
Application Routes
      │
      ▼
Sequelize ORM
      │
      ▼
PostgreSQL Database
```

The application follows the MVC (Model-View-Controller) architecture.

Models manage database operations.

Views render dynamic web pages using EJS.

Controllers (Routes) process user requests.

---

# 🗄 Database Design

## breeds Table

| Column | Description |
|----------|------------|
| id | Breed ID |
| name | Breed Name |
| origin | Country of Origin |
| temperament | Breed Personality |
| description | Breed Description |
| imageUrl | Image URL |
| lifespan | Average Lifespan |
| weight | Average Weight |
| coatType | Coat Type |
| groomingLevel | Grooming Requirements |
| tags | Additional Characteristics |

---

## users Table

| Column | Description |
|----------|------------|
| id | User ID |
| name | User Name |
| email | User Email (unique) |
| password | bcrypt Hashed Password |
| role | Administrator / Viewer |
| phone | Phone Number (optional, unique — collected at registration) |
| reset_otp_hash | bcrypt-hashed one-time password reset code |
| reset_otp_expires_at | Expiry timestamp for the active reset code |

---

## session Table

Auto-created by `connect-pg-simple` on first run. Stores active login sessions in Postgres instead of server memory, so sessions survive serverless cold starts on Vercel.

---

# 🔐 Authentication & Authorization

The application implements secure authentication using:

- bcrypt password hashing
- Express Session, persisted in Postgres (`connect-pg-simple`) rather than in-memory
- Session cookies
- CSRF-protected forms (session-bound tokens, verified on every POST)
- Rate-limited login, registration, and OTP endpoints
- Protected routes
- Role-based middleware (`requireLogin`, `requireAdmin`)

## Account Flows

- **Register** (`/register`) — creates a Viewer account and signs the user in immediately.
- **Login / Logout** (`/login`, `/logout`)
- **Change Password** (`/change-password`) — requires the current password; available to both roles.
- **Forgot Password** (`/forgot-password` → `/verify-otp` → `/reset-password`) — a one-time 6-digit code identifies the account by email. In demo mode (no email service configured) the code is shown directly on screen and logged server-side; if `SMTP_*` variables are set in `.env`, the code is also emailed for real.

## Roles

Two roles exist within the application.

### Administrator

Has full access to CRUD operations and the Admin Dashboard.

### Viewer

Has read-only access to the breed catalog.

Passwords are never stored in plaintext.

---

# 🌐 REST API

## Retrieve All Breeds

```
GET /api/breeds
```

Returns every breed stored in the database. Requires an active login session — an unauthenticated request receives `401 { "error": "Authentication required." }` instead of a redirect.

---

## Retrieve Single Breed

```
GET /api/breeds/:id
```

Returns detailed information for one breed. Also requires an active login session.

---

## Health Check

```
GET /api/health
```

Returns database connectivity status. Not authentication-protected (diagnostic endpoint).

---

# 🚀 Installation

## Prerequisites

Before installing, make sure the following are set up on your machine:

- **Node.js** (v22.x or later) and **npm** — [Download Node.js](https://nodejs.org/)

  Verify your installation:

  ```bash
  node -v
  npm -v
  ```

- A **PostgreSQL** database (this project uses [Neon](https://neon.tech/))
- **Git** installed locally

---

## 1. Clone the repository

```bash
git clone https://github.com/dmpatel90/Petchoice-Part3.git
cd Petchoice-Part3
```

---

## 2. Install dependencies

Install all required packages in one step:

```bash
npm install
```

This installs every dependency listed in `package.json`, including:

| Package | Purpose |
|---|---|
| `express` | Web server framework |
| `sequelize` | ORM for PostgreSQL |
| `pg` / `pg-hstore` | PostgreSQL driver for Sequelize |
| `ejs` | Server-rendered view templates |
| `bcryptjs` | Password & OTP hashing |
| `express-session` | Session-based authentication |
| `connect-pg-simple` | Persists sessions to Postgres instead of server memory |
| `express-rate-limit` | Throttles login / register / OTP requests |
| `helmet` | Secures the app by setting HTTP response headers, including CSP |
| `nodemailer` | Optional real email delivery for OTP codes |
| `dotenv` | Loads environment variables from `.env` |

---

## 3. Configure environment variables

Create a `.env` file:

```env
DATABASE_URL=your_database_url

SESSION_SECRET=your_secret_key

PORT=5500

# Optional — only needed if you want Forgot Password to actually email the
# OTP code instead of just showing it on screen ("demo mode")
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-address@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM=your-address@gmail.com
```

---

## 4. Run the schema migration (one-time)

Registration and password recovery added new columns (`phone`, `reset_otp_hash`, `reset_otp_expires_at`) to the `users` table. If you're pointing at a database that already has a `users` table from an earlier version of this project, bring it up to date once:

```bash
npm run migrate
```

Safe to run again later — it only adds missing columns, it never touches existing data.

---

## 5. Seed default users

```bash
node seedUsers.js
```

---

## 6. Run the application

```bash
node server.js
```

or, using the npm script:

```bash
npm start
```

---

## 7. Open the app

```
http://localhost:5500
```

Or skip local setup entirely and use the live deployment:

```
https://petchoice-part3.vercel.app/
```

---

# 👤 Default User Accounts

Anyone can also [register a free account](/register) — new accounts are always created as Viewer. The accounts below are seeded for demo/testing convenience.

## Administrator

Email

```
admin@petchoice.com
```

Password

```
admin123
```

---

## Viewer

Email

```
viewer@petchoice.com
```

Password

```
viewer123
```

---

# 📂 Project Structure

```
PetChoice
│
├── config
│     database.js
│
├── lib
│     mailer.js
│
├── middleware
│     requireAdmin.js
│     requireLogin.js
│
├── models
│     Breed.js
│     user.js
│     index.js
│
├── public
│     css
│     images
│
├── routes
│     auth.js
│
├── views
│     partials
│     about.ejs
│     adminDashboard.ejs
│     breeds.ejs
│     breedAdd.ejs
│     breedDetails.ejs
│     breedEdit.ejs
│     changePassword.ejs
│     error.ejs
│     forgotPassword.ejs
│     index.ejs
│     login.ejs
│     register.ejs
│     resetPassword.ejs
│     search.ejs
│     verifyOtp.ejs
│
├── screenshots
│     image.png
│     image-1.png
│     image-2.png
│     image-3.png
│     image-4.png
│     image-5.png
│
├── migrate.js
├── seed.js
├── seedUsers.js
├── server.js
├── package.json
└── README.md
```

---

# 📄 Application Pages

Home Page

Displays project introduction, live member/breed counts, and navigation.

---

Breed Catalog

Displays all available breeds. Requires login.

---

Breed Details

Displays complete breed information. Requires login.

---

Search Page

Allows searching by breed name, origin, temperament, coat type, and grooming level. Requires login.

---

Add Breed

Administrator only.

---

Edit Breed

Administrator only.

---

Delete Breed

Administrator only.

---

Admin Dashboard

Administrator only — total breeds, total users, admin/viewer counts, top breed origins, recently added breeds, and the full user account list.

---

Register

Create a free account (Viewer role).

---

Login

Allows users to authenticate.

---

Forgot Password

Request a one-time verification code by email.

---

Verify Code

Enter the 6-digit code sent (or shown in demo mode) to continue account recovery.

---

Reset Password

Set a new password after verifying the code.

---

Change Password

Update your password while logged in (requires current password).

---

About

Project information.

---

Error Page

Displays custom application errors — internal error details are logged server-side only, never shown to the user.

---

# 🔒 Security Features

✔ Helmet, with an active Content Security Policy

✔ Postgres-Backed Sessions (`connect-pg-simple`, not in-memory)

✔ CSRF Protection (session-bound token on every form)

✔ Rate Limiting (login, registration, OTP requests)

✔ bcrypt Password Hashing

✔ One-Time Password (OTP) Account Recovery

✔ Sanitized Error Messages (no internal details shown to users)

✔ Protected Routes — Breed Catalog requires login

✔ Role-Based Authorization

✔ Environment Variables

✔ Secure Session Cookies

✔ Administrator Access Control

---

# 🧪 Testing

The following have been implemented and verified during development (including live end-to-end runs against a real Postgres database — registration, login, CSRF rejection/acceptance, the full OTP password-reset flow, and admin breed CRUD):

✔ CRUD Operations

✔ PostgreSQL Connection

✔ Registration

✔ Authentication

✔ Authorization

✔ Change Password

✔ Forgot Password / OTP Verification

✔ Express Session (Postgres-backed)

✔ Logout

✔ Route Protection

✔ CSRF Protection

✔ Rate Limiting

✔ REST API

✔ Search

✔ Error Handling

✔ Validation

Before presenting live, do a final click-through pass yourselves on the deployed Vercel URL — automated/local verification doesn't replace testing the actual production environment.

---

# 🚧 Future Enhancements

The following features are not yet implemented:

- Favorites
- Profile Management
- Search History
- Recently Viewed Breeds
- Expanded Dashboard Analytics (charts/trends over time)
- Pagination
- Image Upload (currently image URLs only)
- Email Verification at signup
- OTP-based Two-Factor Login (currently OTP is used for password recovery only)
- Automated Test Suite (unit/integration tests)
- Improved Mobile UI

---

# 📸 Screenshots

Screenshots are stored in [`/screenshots`](./screenshots) and embedded below.

### Home Page
![Home Page](./screenshots/image.png)

### Login
![Login Page](./screenshots/image-1.png)

### Breed Catalog
![Breed Catalog](./screenshots/image-2.png)

### Breed Details
![Breed Details](./screenshots/image-3.png)

### Add Breed (Administrator)
![Add Breed](./screenshots/image-4.png)

### Edit Breed (Administrator)
![Edit Breed](./screenshots/image-5.png)

> Screenshots above predate Register, Forgot Password/OTP, Change Password, and the Admin Dashboard — worth adding fresh ones of those pages before final submission.

---

# 👨‍💻 Authors

## Devkumar Manishkumar Patel

Business Information Technology

Seneca Polytechnic

---

## Ebuka Precious Akaegbusi

Business Information Technology

Seneca Polytechnic

---

# 🎓 Course Information

**Course**

WEB700 – Web Programming

**Program**

Business Information Technology

**Institution**

Seneca Polytechnic

**Semester**

Summer 2026

---

# 📜 License

This project was developed for educational purposes as part of the WEB700 Web Programming course at Seneca Polytechnic.

No commercial use is intended.

---

<div align="center">

### ⭐ Thank you for visiting the PetChoice repository!

🔗 **[Try the Live Demo](https://petchoice-part3.vercel.app/)**

If you found this project interesting, feel free to explore the code and provide feedback.

</div>
