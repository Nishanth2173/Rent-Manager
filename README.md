# Rent Manager

A modern rent management dashboard for landlords to track tenants, rent due dates, payments, and monthly reports.

This project is built with **Next.js 15**, **Prisma ORM**, **PostgreSQL**, **Tailwind CSS**, and **NextAuth**.

## ✨ Features

- Manage tenants and property details
- Auto-generate monthly rent records
- Track payment status (Pending, Paid, Overdue)
- View dashboard analytics and collection insights
- Export reports and review audit logs
- Secure login for landlords/admin users

## 🛠️ Tech Stack

- Next.js 15
- React 18
- Prisma ORM
- PostgreSQL
- NextAuth.js
- Tailwind CSS
- Recharts
- XLSX / PDF utilities

## 📁 Project Structure

```text
src/
├── app/              # App Router pages and API routes
├── actions/          # Server actions
├── components/       # Reusable UI components
├── features/         # Feature-specific UI logic
├── lib/              # Auth and Prisma setup
├── styles/           # Global styles
└── utils/            # Helper logic

prisma/
├── schema.prisma     # Database schema
└── seed.js           # Demo seed data
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- PostgreSQL database

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root and add:

```env
DATABASE_URL="postgresql://user:password@host:5432/rent_manager?sslmode=require"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
CRON_SECRET="your-cron-secret"
```

> You can generate a secure secret with:
>
> ```bash
> openssl rand -base64 32
> ```

### 3. Set up the database

```bash
npm run prisma:generate
npm run prisma:push
npm run seed
```

### 4. Run the app

```bash
npm run dev
```

Open http://localhost:3000

## 🔐 Demo Credentials

After running the seed script:

- Email: `landlord@demo.com`
- Password: `password123`

## 📦 Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run prisma:generate
npm run prisma:migrate
npm run prisma:push
npm run prisma:studio
npm run seed
```

## ☁️ Deployment

This project is ready for deployment on platforms like Vercel.

Make sure to set these environment variables in your deployment dashboard:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `CRON_SECRET`

## 📝 License

This project is licensed under the MIT License.
