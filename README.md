# PetChoice - WEB700 Part 3

## Description

PetChoice is a full-stack web application built using:

- Node.js
- Express
- PostgreSQL (Neon)
- Sequelize
- EJS
- Bootstrap

The application allows users to browse, search, add, edit and delete cat breeds stored in a PostgreSQL database.

---

## Features

- Home page
- View all breeds
- Breed details
- Search breeds
- Add breed
- Edit breed
- Delete breed
- REST API
- Health endpoint
- PostgreSQL database
- Sequelize ORM

---

## Installation

npm install

Create a `.env` file:

DATABASE_URL=your_neon_database_url

PORT=5500

Seed the database:

npm run seed

Run:

npm start

---

## API

GET /api/breeds

GET /api/breeds/:id

GET /api/health

---

## Technologies

Node.js

Express

Sequelize

PostgreSQL

Bootstrap 5

EJS