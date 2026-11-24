# Teja International High School App

School management for Teja International High School. The main job is to keep track of **students and their fee payment history**. It also covers staff salaries and the school's income and expenses. There is a **web portal** and a **mobile app** (Android and iOS), both backed by the same server and database.

## Project status

> **The plan for version 2 is agreed and lives in [`doc/`](doc/README.md).** Start there.
>
> - [doc/plan-v2.md](doc/plan-v2.md): the full plan (Admin, Principal and Staff users; Nursery–12th classes; per-student fees; payments, discounts and reversals; Staff tab; Finance tab with loans and purchases)
> - [doc/open-questions.md](doc/open-questions.md): what's still undecided, and what's been decided
> - [doc/hosting-and-stack.md](doc/hosting-and-stack.md): hosting (Railway + Cloudflare R2, about $5–10 a month) and tech stack
> - [doc/v1-prototype.md](doc/v1-prototype.md): what the current code does and what has to change
>
> The code in `web/` and `mobile/` today is the **version 1 prototype** described below. It has Admin and Teacher roles and per-class fees. Version 2 replaces these.

## Version 1 prototype: features

| Feature | Admin | Teacher |
| --- | --- | --- |
| Dashboard (students, fees collected, dues, latest notices) | ✅ | ✅ |
| Students: search, view profile and guardian contact | ✅ | ✅ |
| Students: add, edit, delete | ✅ | — |
| Classes: view students and class teacher | ✅ | ✅ |
| Classes: create, edit, assign class teacher | ✅ | — |
| Notices: read and post | ✅ | ✅ |
| Notices: delete | any notice | own notices |
| Fees: view schedule, balances and payment history | ✅ | ✅ |
| Fees: add fee items, record payments (receipt numbers generated) | ✅ | — |
| Staff accounts: add, disable, reset password | ✅ | — |

## Project layout

```
doc/      Plans and decisions (start here)
web/      Next.js 15 app: web portal + REST API (/api/v1) + Prisma/PostgreSQL
mobile/   Expo (React Native) app that talks to the web app's API
```

All business rules (validation, permissions, fee calculations) live in `web/src/lib/services/`. The web pages and the API both use them, so web and mobile always behave the same.

## Run it locally

Requires Node.js 20+ and a PostgreSQL database.

### 1. Web app and API

```bash
cd web
cp .env.example .env        # then set DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev      # create tables
npm run db:demo             # admin account + sample classes, students, fees (or `npm run db:seed` for the admin only)
npm run dev
```

Open http://localhost:3000 and sign in with `admin@tejaschool.in` / `ChangeMe123!` (the defaults from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`). The demo teachers sign in with `lakshmi@tejaschool.in` / `Teacher123!`, and the same pattern works for arjun@, fatima@ and david@.

**Change the admin password after first sign-in**, or set your own values in `.env` before seeding.

### 2. Mobile app

```bash
cd mobile
npm install
cp .env.example .env        # set EXPO_PUBLIC_API_URL to your web app's address
npx expo start
```

Scan the QR code with **Expo Go** on your phone. A phone can't reach `localhost`, so use your computer's LAN IP (for example `http://192.168.1.20:3000`). You can also change the server address on the sign-in screen under **Server settings**.

## Deploy for everyone to use

### Database: Neon, Supabase, or any Postgres

Create a free PostgreSQL database (for example on [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com)) and copy its connection string.

### Web app and API: Vercel

1. Import this repository at [vercel.com/new](https://vercel.com/new) and set **Root Directory** to `web`.
2. Add these environment variables:
   - `DATABASE_URL`: your Postgres connection string
   - `JWT_SECRET`: a long random string (`openssl rand -base64 48`)
3. Deploy. Then create the tables and the first admin from your computer, pointing at the production database:
   ```bash
   cd web
   DATABASE_URL="<production url>" npx prisma migrate deploy
   DATABASE_URL="<production url>" SEED_ADMIN_EMAIL="you@school.in" SEED_ADMIN_PASSWORD="<strong password>" npm run db:seed
   ```

Any Node host works (Railway, Render, a VPS). Run `npm run build`, `npm run db:deploy`, then `npm start`.

### Mobile app: Expo EAS

```bash
cd mobile
npm install -g eas-cli && eas login
eas init                                  # links the project to your Expo account
# put EXPO_PUBLIC_API_URL=https://<your-vercel-domain> in .env (or as an EAS environment variable)
eas build --profile preview --platform android   # installable APK to share with staff
eas build --profile production --platform all    # store builds
eas submit --platform android                    # upload to Google Play (or ios for the App Store)
```

Before publishing, update the bundle identifier `in.tejaschool.app` in `mobile/app.json` if needed, and replace the icons in `mobile/assets/`.

## API

Every endpoint is under `/api/v1`. Send `Authorization: Bearer <token>` (the token comes from `POST /auth/login`). The web portal uses an httpOnly cookie instead.

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/auth/login` | `{ email, password }` → `{ token, user }` |
| GET | `/me`, `/dashboard` | |
| GET/POST | `/students` | `?q=&classId=&status=ACTIVE\|INACTIVE\|ALL&page=&pageSize=` |
| GET/PATCH/DELETE | `/students/:id` | |
| GET | `/students/:id/fees` | totals, per-fee breakdown, payments |
| GET/POST | `/classes` · GET/PATCH/DELETE `/classes/:id` | |
| GET/POST | `/notices` · PATCH/DELETE `/notices/:id` | |
| GET/POST | `/fees/items` · DELETE `/fees/items/:id` | |
| GET/POST | `/fees/payments` | |
| GET | `/fees/balances` | `?classId=` |
| GET/POST | `/users` · PATCH `/users/:id` | admin only |
| GET | `/teachers` | staff list for dropdowns |

Errors come back as `{ error, details? }` with status 400, 401, 403, 404 or 409.

## Roadmap

See [doc/plan-v2.md](doc/plan-v2.md) for the build order. Not planned for now: parent and student logins, attendance, and marks.
