# Hosting, database & tech stack (decided)

## Context
The school app (see `doc/plan-v2.md`) will store **fee and salary records and passport-size student photos**. The decision is to use **paid plans, at the lowest possible cost**. The app will be maintained by **someone a bit technical**: they can follow steps to redeploy or restore a backup, but won't run Linux servers. The users are in India.

The version 1 prototype already uses Next.js + Prisma + PostgreSQL + Expo. Keeping that stack avoids a rewrite.

## Recommendation: Railway (app + Postgres) + Cloudflare R2 (photos + backups)

Expected cost: **about $5–10 a month (roughly ₹450–900)**.

| Piece | Choice | Cost |
|---|---|---|
| Web portal + API (Next.js) | **Railway Hobby** plan, **Singapore** region (closest available to India). Deploys automatically when code is pushed to GitHub | $5 a month minimum, which includes $5 of usage. A small school app should stay around $5–10 |
| Database | **PostgreSQL on Railway**, same project and region as the app, private network, up to 5 GB on Hobby (years of fee records fit easily) | Included in the usage above |
| Student and staff photos | **Cloudflare R2**, a private bucket. Photos are resized to passport size (about 300×400 px WebP, roughly 30–50 KB each), so 2,000 photos is only about 100 MB | **Free** up to 10 GB, with no download (egress) fees |
| Backups | A **GitHub Actions** job runs every night: `pg_dump` makes a compressed copy of the database and uploads it to a separate R2 bucket. Copies are kept for 30 days of dailies plus 12 monthlies. The restore process is written up in the runbook | Free |
| Domain + DNS | **Cloudflare DNS** (free). Optionally buy a domain through Cloudflare Registrar, sold at cost | ~₹800–1,000 a year, optional |
| Mobile app | **Expo EAS** free build tier. **Android APK first**, shared directly with staff | Free. Play Store costs a one-time ~$25 later; App Store is $99 a year if needed |
| Error alerts | **Sentry** free tier | Free |

**Why Railway:**
- The current code runs on it **unchanged**: normal Node.js, the same Prisma and Postgres, and `sharp` works for resizing images.
- One dashboard holds both the app and the database.
- It deploys automatically from GitHub, and costs are low because billing is by usage.

**What we have to handle ourselves:**
- Railway's Postgres is not fully managed, so the backups to R2 are **our responsibility**. A monthly check that restores a backup proves the backups actually work.
- Singapore is about 50–70 ms away from Indian users. That isn't noticeable for forms and lists.

## Answering "what about Cloudflare?"
- Cloudflare does **not** offer free virtual machines (VMs).
- It does offer generous serverless free tiers, all of which allow commercial use:
  - **Workers** (runs code): 100k requests a day free, or $5 a month for the paid plan
  - **D1** (SQLite database): 30-day point-in-time restore on the paid plan
  - **R2** (file storage): 10 GB free
- An all-Cloudflare setup would cost about **$5 a month in total**, but it needs bigger changes:
  - the database switches from PostgreSQL to **SQLite (D1)**
  - the code would need an adapter to run Next.js on Workers; Cloudflare now recommends a newer tool called "vinext" for new apps
  - there are per-request CPU limits, which matter for password checks and PDFs
  - `sharp` (image resizing) isn't available there
- That means more new technology and more risk for a person who isn't a developer to maintain, to save roughly $0–5 a month.
- So we use Cloudflare where it is clearly best and cheapest: **R2 for photos and backups, plus free DNS**.
- If costs ever need to go lower, moving the app to Cloudflare Workers + D1 is still possible later.

## When to upgrade
If the app outgrows Railway Hobby (more than 5 GB, or you want managed backups and support), the options are **Railway Pro** ($20 a month) or **Supabase Pro** ($25 a month, Mumbai region, daily backups kept for 7 days). Switching only means changing `DATABASE_URL` and restoring the latest backup. The code stays the same.

## Tech stack (unchanged base + additions)

**Language:** TypeScript everywhere.

**Web portal and API (`web/`)**
- Next.js 15 (App Router) for pages, with server actions for forms, plus the REST API at `/api/v1` for the mobile app.
- Tailwind CSS, Prisma with PostgreSQL, and Zod for checking inputs.
- Login: our own sign-in, already in `web/src/lib/auth.ts` and `web/src/lib/token.ts`. Passwords are hashed with bcrypt; logins use JWT tokens (a cookie on web, a Bearer token on mobile).
- All business rules stay in `web/src/lib/services/`: who's allowed to do what, how payments are allocated, interest calculations, and the history log.
- **New:**
  - `@aws-sdk/client-s3`, which talks to R2 using the standard S3 protocol
  - `sharp`, which resizes and crops photos on the server
  - `@react-pdf/renderer` for receipts and student ledgers
  - `exceljs` for Excel exports
- Photos are stored in a private bucket and shown through **short-lived signed links**, so photo addresses are never public.

**Mobile (`mobile/`)**
- Expo SDK 58 with Expo Router.
- Login tokens stored in `expo-secure-store`.
- **New:** `expo-image-picker` and `expo-image-manipulator` to pick a photo, crop it to passport size and compress it before upload.

**Shared code (`packages/shared/`, new)**
- The repo becomes an npm workspaces monorepo.
- The shared package holds the API types, the Zod schemas, and the money and interest calculations (simple and compound interest, late fee, payment allocation).
- It replaces the copy of the API types that currently lives in `mobile/src/lib/api.ts`.

**Data rules**
- Money is stored as integer **paise**.
- Dates are shown in IST.
- Payments, discounts and reversals are only ever added, never edited or deleted.
- A `History` table records who, when, and the old and new values.
- A daily scheduled job on Railway runs the yearly promotion check against the date set in Settings.

**Testing:** Vitest for the money logic, and Playwright for the main flows. Both run in GitHub Actions on every push.

## Environments
- **Local:** Postgres on your own machine plus `npm run dev`.
- **Staging:** a second Railway environment with its own database, used to test changes before they go live.
- **Production:** the Railway production environment. Database changes are applied with `prisma migrate deploy` before each release starts.

## Setup steps
1. **Fix GitHub access.** Pushes are still refused (403), and Railway and GitHub Actions both need the code on GitHub.
2. Create a Railway project in Singapore with two services, Postgres and web (root directory `web`). Set these environment variables: `DATABASE_URL`, `JWT_SECRET`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`.
3. Create the R2 buckets `teja-photos` and `teja-backups`, with access keys limited to those buckets.
4. Add GitHub Actions:
   - `ci.yml`: lint, typecheck and test
   - `backup.yml`: nightly `pg_dump` to R2, with old copies cleaned up
5. Add `web/railway.json` (or a Dockerfile) that sets the build, migrate and start commands, plus a health-check endpoint at `/api/health`.
6. Write `doc/deployment.md`, a runbook covering how to deploy, add environment variables, restore a backup, rotate keys, and upgrade.
7. Then build version 2 in the order given in `doc/plan-v2.md`.

## Verification
- CI passes, and the Railway deploy succeeds with `/api/health` returning OK.
- On production: sign in as Admin; create a student; upload a passport photo and confirm it is resized (about 50 KB) and loads through a signed link that stops working after it expires; add a fee; record a part payment and check the balance; download the PDF receipt.
- Run the backup workflow by hand, then restore the dump into a local Postgres. The row counts should match production.
- An Android preview build (`eas build --profile preview --platform android`) installs on a phone, signs in to production, and shows the same balance and photo.
- After the first month, check the Railway usage page and confirm the bill is within the ~$5–10 estimate.

## Sources (pricing checked November 2026; verify before signing up)
- Railway pricing: [srvrlss.io/provider/railway](https://www.srvrlss.io/provider/railway/), [encore.dev/articles/render-vs-railway](https://encore.dev/articles/render-vs-railway)
- Cloudflare Workers/D1/R2: [srvrlss.io/provider/cloudflare](https://www.srvrlss.io/provider/cloudflare/), [D1 Time Travel docs](https://developers.cloudflare.com/d1/reference/time-travel/), [OpenNext on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/)
- Supabase Pro: [supabase.com/pricing](https://supabase.com/pricing)
- Neon: [jetadmin.io/blog/neon-pricing](https://www.jetadmin.io/blog/neon-pricing/)
