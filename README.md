# RentFlow — Rent Management System

A production-ready rent management web application for landlords and property owners.

Built with **Next.js 15**, **Prisma ORM**, **PostgreSQL** (Neon/Supabase), **Tailwind CSS**, and **Framer Motion**.

---

## ✨ Features

- **Tenant Management** — Add, edit, delete, search, and filter tenants
- **Automatic Rent Generation** — Rent records auto-created monthly per tenant
- **Overdue Detection** — Automatic status updates (Pending → Overdue)
- **Payment Tracking** — Mark rent as paid with method, reference, and notes
- **Cumulative Due Calculation** — Shows total unpaid across multiple months
- **Dashboard Analytics** — Charts, stats, collection rate, alerts
- **Notifications** — Overdue tenants, upcoming dues, multi-month pending
- **Reports** — Monthly breakdown with CSV export
- **Audit Logs** — Track all create/update/delete/payment actions
- **Auth** — Secure JWT-based login with NextAuth
- **Dark Mode** — Full dark glassmorphism UI
- **Responsive** — Mobile-friendly with collapsible sidebar

---

## 🗂️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/
│   │   ├── auth/           # NextAuth API route
│   │   └── cron/           # Rent generation cron endpoint
│   ├── dashboard/
│   ├── tenants/
│   │   ├── add/
│   │   └── [id]/
│   │       └── edit/
│   ├── payments/
│   ├── reports/
│   ├── settings/
│   └── login/
├── actions/                # Next.js Server Actions
│   ├── tenantActions.js
│   ├── paymentActions.js
│   ├── reportActions.js
│   └── settingsActions.js
├── components/             # Reusable UI components
│   ├── charts/
│   ├── layout/
│   ├── shared/
│   └── ui/
├── features/               # Feature-specific client components
│   ├── dashboard/
│   ├── tenants/
│   ├── payments/
│   ├── reports/
│   └── settings/
├── lib/                    # Core libraries (prisma, auth)
├── styles/                 # Global CSS
└── utils/                  # Helpers and rent generation logic
prisma/
├── schema.prisma           # Database schema
└── seed.js                 # Demo data seeder
middleware.js               # Route protection
```

---

## 🗄️ Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `User` | Landlord accounts with roles |
| `Tenant` | Tenant records with rent config |
| `RentRecord` | Monthly rent entries (auto-generated) |
| `Payment` | Individual payment transactions |
| `AuditLog` | All system actions |

### Key Relationships
- `User` → many `Tenant`s
- `Tenant` → many `RentRecord`s
- `RentRecord` → many `Payment`s
- All linked via cascade deletes

---

## 🚀 Quick Start (Local Development)

### 1. Clone and install

```bash
git clone <your-repo>
cd rent-manager
npm install
```

### 2. Setup environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Get this from Neon (neon.tech) or Supabase (supabase.com)
DATABASE_URL="postgresql://user:password@host:5432/rent_manager?sslmode=require"

# Generate: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Setup database

```bash
# Generate Prisma client
npm run prisma:generate

# Push schema to database (first time)
npm run prisma:push

# OR use migrations (recommended for production)
npm run prisma:migrate

# Seed with demo data
npm run seed
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo Login:** `landlord@demo.com` / `password123`

---

## ☁️ Deployment Guide — Vercel + Neon PostgreSQL

### Step 1: Create PostgreSQL Database (Neon — Free Tier)

1. Go to [neon.tech](https://neon.tech) → Sign up free
2. Create a new project → Name it `rent-manager`
3. Copy the **Connection String** (pooled connection)
   - Looks like: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

> **Alternative: Supabase**
> 1. Go to [supabase.com](https://supabase.com) → New project
> 2. Go to Settings → Database → Connection string → URI mode
> 3. Use the **Transaction pooler** URL for serverless environments

### Step 2: Deploy to Vercel

1. Push your project to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your repo
3. **Set Environment Variables** in Vercel dashboard:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Neon/Supabase connection string |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` output |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |

4. Click **Deploy**

### Step 3: Run Database Migrations on Production

After deployment, run in your terminal:

```bash
# Set the production DATABASE_URL temporarily
export DATABASE_URL="your-production-connection-string"

npx prisma migrate deploy
npx prisma db seed
```

Or use the Vercel CLI:

```bash
vercel env pull .env.production.local
npx prisma migrate deploy
```

### Step 4: Setup Cron Job (Auto Rent Generation)

Add to `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/generate-rent",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

This runs on the 1st of every month at midnight to auto-generate rent records.

Add `CRON_SECRET` to your env vars for security:

```env
CRON_SECRET="some-random-secret"
```

---

## 🔧 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | Random secret for JWT signing |
| `NEXTAUTH_URL` | ✅ | Full URL of your deployed app |
| `CRON_SECRET` | Optional | Secures the cron endpoint |

---

## 📦 Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 15 | App Router, Server Actions, SSR |
| Prisma ORM | Database queries and migrations |
| PostgreSQL | Primary database (via Neon/Supabase) |
| NextAuth.js | Authentication (JWT sessions) |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Recharts | Dashboard charts |
| React Hook Form | Form handling |
| bcryptjs | Password hashing |
| Zod | Input validation |
| XLSX | CSV export |
| Lucide React | Icons |

---

## 🛠️ Key NPM Scripts

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run DB migrations
npm run prisma:push      # Push schema (no migration history)
npm run prisma:studio    # Open Prisma Studio (DB GUI)
npm run seed             # Seed demo data
```

---

## 🔐 Default Login

After seeding:

- **Email:** `landlord@demo.com`
- **Password:** `password123`

---

## 📊 Rent Generation Logic

1. When a tenant is added, a rent record is auto-created for the current month
2. On every dashboard/tenant page load, `generateMonthlyRentForAll()` runs
3. The cron job `/api/cron/generate-rent` handles monthly generation in production
4. Records past their due date automatically transition from `PENDING` → `OVERDUE`
5. Cumulative dues are calculated by summing all `PENDING` + `OVERDUE` records per tenant

---

## 💡 Adding a New Admin User

```bash
# In Prisma Studio or via seed script
npx prisma studio
# Create a User with role: ADMIN and hashed password
```

Or update the seed file and re-run `npm run seed`.

---

## 📝 License

MIT — free to use and modify.
