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

PetChoice is a full-stack web application that enables users to discover, browse, search, and manage information about cat breeds.

The application was developed as the final project for **WEB700 – Web Programming** at **Seneca Polytechnic**.

The goal of the project is to demonstrate practical knowledge of:

- Full Stack Web Development
- RESTful API Design
- Database Management
- Authentication & Authorization
- Secure Web Programming
- MVC Design Pattern
- CRUD Operations
- Responsive Web Design

The application integrates PostgreSQL with Node.js using Sequelize ORM and provides a secure authentication system with role-based access control.

---

# 🚀 Live Demo

The application is deployed and publicly accessible on Vercel:

🔗 **[https://petchoice-part3.vercel.app/](https://petchoice-part3.vercel.app/)**

Use the [Default User Accounts](#-default-user-accounts) below to log in and explore both Administrator and Viewer roles.

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
- Follow modern Node.js development practices

---

# ✨ Application Features

## 🐱 Breed Catalog

Users can:

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

---

## ✏ Administrator Features

Administrator users can:

- Login
- Logout
- Browse breeds
- Search breeds
- Add new breeds
- Edit existing breeds
- Delete breeds
- Manage all breed records

---

## 👤 Viewer Features

Viewer users can:

- Login
- Logout
- Browse breeds
- Search breeds
- View breed information

Viewer users cannot:

- Add breeds
- Edit breeds
- Delete breeds

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

- bcrypt.js
- Express Session
- Helmet
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
| email | User Email |
| password | bcrypt Hashed Password |
| role | Administrator / Viewer |

---

# 🔐 Authentication & Authorization

The application implements secure authentication using:

- bcrypt password hashing
- Express Session
- Session cookies
- Protected routes
- Role-based middleware

Two roles exist within the application.

## Administrator

Has full access to CRUD operations.

## Viewer

Has read-only access.

Passwords are never stored in plaintext.

---

# 🌐 REST API

## Retrieve All Breeds

```
GET /api/breeds
```

Returns every breed stored in the database.

---

## Retrieve Single Breed

```
GET /api/breeds/:id
```

Returns detailed information for one breed.

---

## Health Check

```
GET /api/health
```

Returns database connectivity status.

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
| `bcryptjs` | Password hashing |
| `express-session` | Session-based authentication |
| `helmet` | Secures the app by setting HTTP response headers |
| `dotenv` | Loads environment variables from `.env` |

If you ever need to install any of these individually (e.g. after a fresh `package.json`), you can run:

```bash
npm install express sequelize pg pg-hstore ejs bcryptjs express-session helmet dotenv
```

Helmet specifically can be installed on its own with:

```bash
npm install helmet
```

and is enabled in `server.js` via:

```javascript
const helmet = require("helmet");
app.use(helmet());
```

---

## 3. Configure environment variables

Create a `.env` file

```env
DATABASE_URL=your_database_url

SESSION_SECRET=your_secret_key

PORT=5500
```

## 4. Seed default users

```bash
node seedUsers.js
```

## 5. Run the application

```bash
node server.js
```

or, using the npm script:

```bash
npm start
```

## 6. Open the app

```
http://localhost:5500
```

Or skip local setup entirely and use the live deployment:

```
https://petchoice-part3.vercel.app/
```

---

# 👤 Default User Accounts

## Administrator

Email

```
admin@abc.com
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
├── middleware
│
├── models
│     Breed.js
│     user.js
│     index.js
│
├── public
│     css
│     images
│     js
│
├── routes
│     auth.js
│
├── views
│     partials
│     about.ejs
│     breeds.ejs
│     breedAdd.ejs
│     breedDetails.ejs
│     breedEdit.ejs
│     error.ejs
│     index.ejs
│     login.ejs
│     search.ejs
│
├── docs
│     screenshots
│           home.png
│           login.png
│           breeds.png
│           breedDetails.png
│           breedAdd.png
│           breedEdit.png
│
├── seedUsers.js
├── server.js
├── package.json
└── README.md
```

---

# 📄 Application Pages

Home Page

Displays project introduction and navigation.

---

Breed Catalog

Displays all available breeds.

---

Breed Details

Displays complete breed information.

---

Search Page

Allows searching by breed name and origin.

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

Login

Allows users to authenticate.

---

About

Project information.

---

Error Page

Displays custom application errors.

---

# 🔒 Security Features

✔ Helmet

✔ Express Session

✔ bcrypt Password Hashing

✔ Protected Routes

✔ Role-Based Authorization

✔ Environment Variables

✔ Secure Session Cookies

✔ Administrator Access Control

---

# 🧪 Testing

The following features have been tested.

✔ CRUD Operations

✔ PostgreSQL Connection

✔ Authentication

✔ Authorization

✔ Express Session

✔ Logout

✔ Route Protection

✔ REST API

✔ Search

✔ Error Handling

✔ Validation

---

# 🚧 Future Enhancements

The following features will be implemented in the final version.

- User Registration
- Change Password
- User Dashboard
- Favorites
- Profile Management
- Search History
- Recently Viewed Breeds
- Dashboard Analytics
- Pagination
- Image Upload
- Email Verification
- Password Reset
- Improved Mobile UI

---

# 📸 Screenshots

Screenshots are stored in [`/docs/screenshots`](./docs/screenshots) and embedded below.

### Home Page
![Home Page](./docs/screenshots/home.png)

### Login
![Login Page](./docs/screenshots/login.png)

### Breed Catalog
![Breed Catalog](./docs/screenshots/breeds.png)

### Breed Details
![Breed Details](./docs/screenshots/breedDetails.png)

### Add Breed (Administrator)
![Add Breed](./docs/screenshots/breedAdd.png)

### Edit Breed (Administrator)
![Edit Breed](./docs/screenshots/breedEdit.png)

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
