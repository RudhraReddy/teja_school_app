# Open questions and decisions

## Still open

1. **Staff tab visibility:** can Staff users see the Staff tab, including other people's salaries? Or should only the Admin and Principal see it?
2. **Salary advances:** should an advance be subtracted automatically from the next month's salary, or just recorded on its own?
3. **Promotion:**
   - Are students in 12th class marked as "passed out"?
   - Do we need a way to hold a student back (keep them in the same class) before the promotion runs?
4. **Loans:** is the school only borrowing, or does it also lend to people outside the staff?
5. **Notices:** keep or remove?
6. **Expense categories:** is "food, bus fuel, equipment" the starting list, and can the Admin or Principal add more?

## Decided

| Topic | Decision |
| --- | --- |
| Users | Admin (everything), Principal (almost everything), Staff (view, plus a few actions) |
| Parent and student logins | No |
| Classes | Nursery, LKG, UKG, 1st–12th; **no sections** |
| Yearly promotion | Automatic. The date is set in Settings by the Admin or Principal |
| How fees are set | Per student (no class-wide fees) |
| Payments | Any amount at any time. You can choose which fee item(s) it pays; otherwise it pays the oldest first |
| Discounts | Admin and Principal only. Shown in the payment history |
| Reversals | Admin and Principal only. Never deleted; shown in the payment history as reversed |
| Fee items after they're added | Staff cannot edit or remove them. All changes are visible in the student's history |
| Student page | Search and filter (name, class, pending fee). Snapshot shows the pending fee or a green "All paid", plus payment history |
| Profile photos | Yes, for students and staff. More profile fields will be added later |
| Staff loans | No. Staff get **advances** instead (no interest) |
| Loan interest | Simple or compound, chosen per loan |
| Late fee on loans | An option on every loan, 0 by default |
| Purchases | Fixed amount, no interest, can be paid at a later date |
| Hosting | Paid but lowest cost: Railway Hobby (Next.js + Postgres, Singapore) + Cloudflare R2 for photos and nightly backups, about $5–10 a month. See [hosting-and-stack.md](hosting-and-stack.md) |
| Tech stack | TypeScript: Next.js 15 + Prisma + PostgreSQL (web and API), Expo (mobile), shared package for money and interest calculations |
| Photos | Passport-size, resized to about 300×400 WebP (~30–50 KB), private storage with short-lived signed links |
| Finance tracking | All income (fees, other charges) and expenses (purchases, salaries); pending fees for the current academic year |
