# 🐱 PetChoice – WEB700 Part 4 (Phase 2)

> A full-stack web application for exploring and managing cat breeds with secure user authentication and role-based access control.

---

## 📖 Project Overview

**PetChoice** is a web application developed for the **WEB700 – Web Programming** course at **Seneca Polytechnic**.

The application allows users to browse, search, and manage cat breed information while implementing secure authentication and authorization using modern web technologies.

---

# ✨ Features

## 🐱 Breed Management

- Browse all cat breeds
- View detailed breed information
- Search breeds by:
  - Name
  - Origin
  - Temperament
  - Coat Type
- Add new breeds *(Administrator only)*
- Edit breed information *(Administrator only)*
- Delete breeds *(Administrator only)*

---

## 🔐 Authentication & Security

- User Login
- User Logout
- Administrator and Viewer accounts
- Password hashing using **bcrypt**
- Express Session authentication
- Role-based authorization
- Protected CRUD operations
- Helmet security middleware
- Environment variables for sensitive credentials

---

## 🌐 REST API

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/breeds` | Retrieve all breeds |
| GET | `/api/breeds/:id` | Retrieve a specific breed |
| GET | `/api/health` | Check API and database status |

---

# 💻 Technologies Used

### Backend

- Node.js
- Express.js
- Sequelize ORM
- PostgreSQL (Neon)

### Frontend

- EJS
- Bootstrap 5
- HTML5
- CSS3
- JavaScript

### Security

- Express Session
- bcrypt.js
- Helmet
- dotenv

---

# 📂 Project Structure

```
PetChoice-Part4/
│
├── config/
│   └── database.js
│
├── models/
│   ├── Breed.js
│   ├── User.js
│   └── index.js
│
├── routes/
│   └── auth.js
│
├── public/
│   ├── css/
│   ├── js/
│   └── images/
│
├── views/
│   ├── partials/
│   ├── breeds.ejs
│   ├── breedDetails.ejs
│   ├── breedAdd.ejs
│   ├── breedEdit.ejs
│   ├── login.ejs
│   └── ...
│
├── seedUsers.js
├── server.js
├── package.json
├── README.md
└── .env
```

---

# 🚀 Installation

## Clone the Repository

```bash
git clone https://github.com/your-repository-url.git
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create a `.env` file in the root directory.

```env
DATABASE_URL=your_neon_database_url
SESSION_SECRET=your_secret_key
PORT=5500
```

---

## Seed Default Users

```bash
node seedUsers.js
```

---

## Start the Application

```bash
npm start
```

or

```bash
node server.js
```

---

# 👤 Default User Accounts

## Administrator

| Email | Password |
|--------|----------|
| admin@abc.com | admin123 |

---

## Viewer

| Email | Password |
|--------|----------|
| viewer@petchoice.com | viewer123 |

---

# 🔒 User Roles

## 👑 Administrator

Can:

- Login
- Logout
- View all breeds
- Search breeds
- Add breeds
- Edit breeds
- Delete breeds

---

## 👤 Viewer

Can:

- Login
- Logout
- View breeds
- Search breeds

Cannot:

- Add breeds
- Edit breeds
- Delete breeds

---

# 🛡 Security Features

- Secure password hashing with **bcrypt**
- Express Session authentication
- Role-based authorization
- Protected administrator routes
- Helmet security middleware
- Session secret stored in environment variables

---

# 📸 Application Screenshots

Include screenshots of:

- Home Page
- Login Page
- Breed Catalog
- Breed Details
- Add Breed
- Edit Breed
- Admin Dashboard *(Upcoming)*
- User Authentication
- PostgreSQL Database

---

# 🚧 Planned Features

The following features are currently under development:

- ✅ User Registration
- ✅ Change Password
- ✅ User Profile
- ✅ Admin Dashboard
- ✅ Favorites
- ✅ Restrict Breed Catalog access to registered users only
- ✅ Improved Login & Registration UI
- ✅ Additional security enhancements

---

# 📚 Course Information

**Course:** WEB700 – Web Programming

**Institution:** Seneca Polytechnic

**Semester:** Summer 2026

---

# 👨‍💻 Authors

### Devkumar Manishkumar Patel

Business Information Technology

Seneca Polytechnic

---

### Ebuka Precious Akaegbusi

Business Information Technology

Seneca Polytechnic

---

# 📄 License

This project was developed for educational purposes as part of the **WEB700 – Web Programming** course at **Seneca Polytechnic**.
