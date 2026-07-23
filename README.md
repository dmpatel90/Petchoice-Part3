# 🐱 PetChoice – Find Your Perfect Feline Companion
## WEB700 Project Part 3 – PostgreSQL, CRUD & Deployment

**Team:** Devkumar Manishkumar Patel (129281259) & Ebuka Precious Akaegbusi (122833254)
**Course:** WEB700 Web Programming – Summer 2026
**Professor:** Shahdad Shariatmadari
**GitHub:** https://github.com/dmpatel90/PetChoice-Part2 *(update to Part3 repo URL)*
**Deployed URL:** *(add Vercel URL after deployment)*

---

## How Part 3 Extends Part 2

| Feature | Part 2 | Part 3 |
|---|---|---|
| Data source | Local `breeds.json` file | Neon PostgreSQL database |
| Data access | `fs.readFileSync` | Sequelize ORM |
| CRUD | Read-only | Full Create, Read, Update, Delete |
| Deployment | Local only | Vercel (connected to Neon) |
| Search | In-memory array filter | PostgreSQL `ILIKE` query |

---

## Installation & Running Locally

### Prerequisites
- Node.js v18+
- A Neon PostgreSQL account and project

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/dmpatel90/PetChoice-Part3
cd PetChoice-Part3

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and paste your Neon DATABASE_URL

# 4. Seed the database (run once)
npm run seed

# 5. Start the server
npm start

# 6. Open in browser
# http://localhost:3000
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL pooled connection string |
| `PORT` | Optional — defaults to 3000 |

**Never commit `.env` to GitHub.** Use `.env.example` as a template.

---

## PostgreSQL Table — `breeds`

### JSON → Database Field Mapping

| JSON Field | PostgreSQL Column | Type | Notes |
|---|---|---|---|
| `id` | `breed_id` | VARCHAR(20) PK | e.g. breed-001 |
| `name` | `name` | VARCHAR(100) UNIQUE NOT NULL | |
| `origin` | `origin` | VARCHAR(100) NOT NULL | |
| `temperament` | `temperament` | TEXT NOT NULL | |
| `description` | `description` | TEXT NOT NULL | |
| `image_url` | `image_url` | TEXT | nullable |
| `details.lifespan` | `lifespan` | VARCHAR(50) | flattened from nested object |
| `details.weight` | `weight` | VARCHAR(50) | flattened from nested object |
| `details.coatType` | `coat_type` | VARCHAR(50) | flattened from nested object |
| `details.groomingLevel` | `grooming_level` | VARCHAR(20) | flattened — Low/Medium/High |
| `tags` | `tags` | JSONB | stored as JSON array |

**Design decision on nested data:** The `details` nested object was flattened into individual columns because each field (lifespan, weight, coat_type, grooming_level) is a simple scalar value that benefits from being queryable and filterable independently. The `tags` array was stored as JSONB because it is a variable-length list of strings that does not need relational querying.

---

## Sequelize Model

File: `models/Breed.js`
- Table name: `breeds`
- Primary key: `breed_id` (string)
- `timestamps: false` — no createdAt/updatedAt
- Validation: name required + unique, description min 10 chars, grooming_level enum check
- JSONB field: `tags`

---

## Route Table

### JSON / API Routes

| Method | Route | Output | Purpose |
|---|---|---|---|
| GET | `/api/breeds` | JSON | Return all breeds from PostgreSQL |
| GET | `/api/breeds/:id` | JSON | Return one breed by ID (404 if not found) |
| GET | `/api/search?keyword=&origin=&grooming=` | JSON | Search breeds with optional filters |
| GET | `/api/health` | JSON | Confirm deployed app can reach Neon DB |

### HTML / EJS Routes

| Method | Route | Output | Purpose |
|---|---|---|---|
| GET | `/` | HTML | Home page with stats and feature overview |
| GET | `/breeds` | HTML | Display all breeds as card grid |
| GET | `/breeds/:id` | HTML | Full detail page for one breed |
| GET | `/breeds/search` | HTML | Search form with keyword + origin + grooming filters |
| GET | `/breeds/add` | HTML | Insert form for adding a new breed |
| POST | `/breeds/add` | Redirect | Validate and insert new breed into PostgreSQL |
| GET | `/breeds/:id/edit` | HTML | Prepopulated update form |
| POST | `/breeds/:id/edit` | Redirect | Validate and update breed in PostgreSQL |
| POST | `/breeds/:id/delete` | Redirect | Delete breed from PostgreSQL with confirmation |

---

## CRUD Operations — PetChoice Context

| Operation | Business Meaning | Route |
|---|---|---|
| **Create** | Add a newly discovered or user-submitted cat breed | POST `/breeds/add` |
| **Read all** | Browse the full breed catalogue | GET `/breeds` and GET `/api/breeds` |
| **Read one** | View full details for a specific breed | GET `/breeds/:id` |
| **Search** | Find breeds by temperament, name, origin, or grooming level | GET `/breeds/search` |
| **Update** | Correct breed information or update details | POST `/breeds/:id/edit` |
| **Delete** | Remove a duplicate or incorrect breed record | POST `/breeds/:id/delete` |

---

## Validation Rules

| Field | Rule |
|---|---|
| name | Required, min 2 chars, must be unique |
| origin | Required |
| temperament | Required |
| description | Required, min 10 characters |
| grooming_level | Must be Low, Medium, or High if provided |
| tags | Comma-separated string, split and lowercased before insert |

---

## Deployment — Vercel + Neon

1. Push source code to GitHub (no `.env`, no `node_modules`)
2. Go to [vercel.com](https://vercel.com) → Import GitHub repository
3. Add environment variable: `DATABASE_URL` = your Neon **pooled** connection string
4. Deploy
5. Test: `https://your-app.vercel.app/api/health`

---

## Data Import / Initialization

Run once after setting up the database:

```bash
npm run seed
```

This reads `data/breeds.json`, transforms each record to match the PostgreSQL schema, and uses `findOrCreate` to safely insert without duplicating existing records.

---

## Known Limitations

- No user authentication — all CRUD operations are open
- Image URLs point to The Cat API CDN — some may break if the CDN changes
- No pagination on the breeds list page (151+ records load at once)

---

## Team Contributions

| Task | Owner |
|---|---|
| Neon database setup & team invitations | Devkumar |
| PostgreSQL table design & seed script | Devkumar |
| Sequelize model & config | Devkumar |
| API JSON routes (`/api/...`) | Devkumar |
| HTML/EJS routes & CRUD routes | Ebuka |
| EJS views (list, detail, add, edit, search) | Ebuka |
| CSS & front-end styling | Both |
| Vercel deployment & environment setup | Both |
| README & documentation | Ebuka |
| Testing & screenshots | Both |

---

## Academic Integrity

We declare this assignment is our own work. Generative AI was used to assist with boilerplate setup, documentation formatting, and code review. All routes, models, views, and database operations were reviewed, tested, and understood by both team members.
