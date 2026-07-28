# PetChoice – WEB700 Project Part 3

## Project Title

**PetChoice – Pet Breed Management System**

---

# Business Idea

PetChoice is a web application designed to help users browse and manage information about pet breeds. The application allows users to search for breeds, view detailed breed information, and perform CRUD (Create, Read, Update, Delete) operations on breed records stored in a PostgreSQL database.

---

# Target Users

The application is intended for:

- Pet owners
- Animal enthusiasts
- Veterinary clinics
- Animal shelters
- Students learning database-driven web applications

---

# Part 3 Overview

Part 3 extends the functionality developed in Part 2.

### Part 2

- Stored breed data in a local JSON file
- Displayed information using Express and EJS
- Supported browsing and searching breeds

### Part 3

- Migrated breed data to a Neon PostgreSQL database
- Integrated Sequelize ORM
- Added CRUD functionality
- Added REST API endpoints
- Added Health Check endpoint
- Added database initialization using seed.js
- Improved project organization using models and reusable EJS templates

---

# Technology Stack

- Node.js
- Express.js
- PostgreSQL (Neon)
- Sequelize ORM
- EJS
- CSS
- dotenv

---

# Database

Database Provider:

Neon PostgreSQL

Table:

```
breeds
```

### Table Description

| Column | Description |
|----------|-------------|
| id | Unique breed identifier |
| name | Breed name |
| origin | Country of origin |
| temperament | Breed temperament |
| description | Breed description |
| imageUrl | Image URL |
| lifespan | Average lifespan |
| weight | Average weight |
| coatType | Coat type |
| groomingLevel | Grooming requirements |
| tags | Breed tags |

---

# JSON to Database Field Mapping

| JSON Field | PostgreSQL Column |
|------------|------------------|
| id | id |
| name | name |
| origin | origin |
| temperament | temperament |
| description | description |
| imageUrl | imageUrl |
| lifespan | lifespan |
| weight | weight |
| coatType | coatType |
| grooming_level | groomingLevel |
| tags | tags |

---

# Sequelize Model

The application uses a Sequelize model named:

```
Breed
```

The model maps directly to the PostgreSQL **breeds** table.

Example operations:

```javascript
Breed.findAll()

Breed.findByPk()

Breed.create()

Breed.update()

Breed.destroy()
```

Sequelize automatically converts these JavaScript methods into SQL queries.

---

# Application Routes

| Method | Route | Output | Purpose |
|---------|-------|--------|---------|
| GET | / | HTML | Home page |
| GET | /breeds | HTML | Display all breeds |
| GET | /breeds/:id | HTML | Display one breed |
| GET | /search | HTML | Search breeds |
| GET | /breeds/add | HTML | Display add form |
| POST | /breeds/add | Redirect | Create breed |
| GET | /breeds/:id/edit | HTML | Display edit form |
| POST | /breeds/:id/edit | Redirect | Update breed |
| POST | /breeds/:id/delete | Redirect | Delete breed |
| GET | /api/breeds | JSON | Return all breeds |
| GET | /api/breeds/:id | JSON | Return one breed |
| GET | /api/health | JSON | Health check |

---

# Project Structure

```
PetChoice_part3

config/
models/
views/
views/partials/
public/css/
data/

server.js
seed.js
package.json
.env
README.md
```

---

# Local Installation

Clone the repository

```bash
git clone https://github.com/dmpatel90/Petchoice-Part3.git
```

Move into the project

```bash
cd PetChoice_part3
```

Install dependencies

```bash
npm install
```

---

# Environment Variables

Create a file named

```
.env
```

Required variables

```env
DATABASE_URL= postgresql://neondb_owner:npg_4IgOsB5oTGEA@ep1-royal-dew-axfcrfa0-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

PORT=5500
```

Never commit the `.env` file to GitHub.

---

# Data Initialization

The application includes a script named

```
seed.js
```

Purpose:

- Reads the original JSON dataset
- Connects to PostgreSQL
- Inserts all breed records into the database

Run

```bash
npm run seed
```

Only run this when initially populating or resetting the database.

---

# Running the Application

Development

```bash
npm run dev
```

Production

```bash
npm start
```

Open

```
http://localhost:5500
```

---

# Testing

Verify the following routes:

```
/
```

```
/breeds
```

```
/search
```

```
/breeds/add
```

```
/api/breeds
```

```
/api/breeds/:id
```

```
/api/health
```

Also verify:

- Add Breed
- Edit Breed
- Delete Breed
- Search functionality
- Database updates in PostgreSQL

---

# GitHub Repository

```
https://github.com/dmpatel90/Petchoice-Part3.git
```

---

# Deployed Application

```
https://YOUR-VERCEL-PROJECT.vercel.app / Not yet deployed
```

---

# Known Limitations

- No user authentication
- No pagination
- Limited server-side form validation
- Images are referenced by URL only
- No file upload functionality
- Search currently supports selected fields only

---

# Team Member Contributions

| Team Member | Contributions |
|--------------|--------------|
| Ebuka Precious | Project architecture, Express server, PostgreSQL integration, Sequelize model, CRUD routes, REST API, debugging, documentation |
| Team Member 2 | Update with actual contributions |
| Team Member 3 | Update with actual contributions |

---

# Generative AI Disclosure

Generative AI tools, including ChatGPT, were used to assist with:

- Explaining project concepts
- Reviewing Express and Sequelize code
- Debugging runtime and routing errors
- Improving code organization
- Drafting documentation
- Preparing the project presentation

All generated content was reviewed, tested, modified where necessary, and integrated by the project team. The team remains responsible for the final implementation, testing, and submission.

---

# License

This project was developed for educational purposes as part of the WEB700 course.
