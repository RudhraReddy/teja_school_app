# Version 1 prototype: what exists today

The code in `web/` and `mobile/` is a working **first prototype**, built before the version 2 plan was agreed. It is a useful base, but parts of it must change.

## What it does

- **Web** (Next.js, PostgreSQL through Prisma):
  - a portal for **Admin** and **Teacher** users
  - REST API under `/api/v1`
  - dashboard, students, classes (with sections), notices, fees, and staff accounts
- **Mobile** (Expo): uses the same API. It has the dashboard, student search and profile with fees, classes, notices and fee balances. It can post notices and record payments.
- **Fees:** fee items are set **per class** (or for the whole school). Each payment is tied to one fee item.

## What changes for version 2

| Area | Today (v1) | Planned (v2) |
| --- | --- | --- |
| Roles | Admin, Teacher | Admin, Principal, Staff |
| Classes | Free-text name + section | Fixed list Nursery → 12th, no sections, yearly promotion |
| Academic year | None | Required; balances carry forward |
| Fee items | Per class | Per student |
| Payments | Tied to a single fee item | Choose one or more fee items; otherwise oldest first |
| Discounts | None | Admin/Principal; shown in history |
| Reversals | None | Admin/Principal; never deleted, shown in history |
| History log | None | Every change recorded (who, when, old and new values) |
| Student UI | List + detail page | List with filters, quick snapshot, all-paid indicator, photo |
| Staff | Login accounts only | Full staff profiles, salary history, salary payments, advances |
| Finance | Fee totals only | Income/expenses, purchases, loans (simple/compound), dashboard |
| Notices | Built | Keep or remove (open question) |
| Settings | None | Promotion date and other options |

## What can be reused

- The project structure: one shared set of server-side business-rule code (`web/src/lib/services/`) used by both the web pages and the API.
- Sign-in (cookie for web, token for mobile) and the error handling.
- The page layout and the shared components on both web and mobile.
- The deployment setup (Vercel + Postgres for web, Expo EAS for mobile).

The database schema will be redesigned for version 2. The prototype only holds demo data, so nothing needs migrating.
