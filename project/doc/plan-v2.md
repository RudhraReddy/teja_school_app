# Teja International High School App: Plan (version 2)

Status: **agreed, not built yet.** Details may change; see [open-questions.md](open-questions.md).

## Goal

The app mainly keeps track of **students and their fee payment history**. It also covers staff, salaries, and the school's money coming in and going out. Admin, Principal and Staff users work from the web portal and the mobile app. Parents and students do **not** log in.

---

## 1. Users and permissions

There are three types of user:

- **Admin:** full access and control.
- **Principal:** almost everything Admin can do, except managing user accounts.
- **Staff:** mostly view-only. They can add students, add fees and record payments.

| Action | Admin | Principal | Staff |
| --- | :-: | :-: | :-: |
| View students, fees, payment history | ✅ | ✅ | ✅ |
| Create or edit a student | ✅ | ✅ | ✅ |
| Add fee items to a student | ✅ | ✅ | ✅ |
| Edit or remove a fee item after it's added (logged in history) | ✅ | ✅ | ❌ |
| Record a fee payment | ✅ | ✅ | ✅ |
| Give a discount or concession | ✅ | ✅ | ❌ |
| Reverse a wrong payment | ✅ | ✅ | ❌ |
| Staff tab: profiles, salaries, advances | ✅ | ✅ | ❓ *(open question)* |
| Finance: loans, purchases, income and expenses | ✅ | ✅ | ❌ |
| Settings (promotion date and others) | ✅ | ✅ | ❌ |
| Manage user accounts | ✅ | ❌ | ❌ |

Every change is written to a **history log**: who made it, when, and the old and new values.

---

## 2. Classes and academic year

- There are 15 fixed classes, in this order: **Nursery, LKG, UKG, 1st, 2nd … 12th**.
- **There are no sections.** A student is assigned a class when they're created.
- Everything belongs to an **academic year** (for example 2026–27).
- **Yearly promotion:** every active student moves up one class on a set date.
  - The Admin or Principal sets that date in **Settings**.
  - Any unpaid balance carries forward into the new academic year.
  - Students in 12th class are marked as passed out *(to be confirmed)*.

---

## 3. Students tab

### List
- Search by name or admission number.
- Filter by class and by fee status (**pending** or **all paid**).
- Sort by pending amount.

### Quick snapshot (opens when you click a student)
- Profile photo, name, class, and parent's phone.
- The **pending fee**, or a green **"All paid ✓"** badge.
- Payment history.
- Actions: Record payment, Add fee, and (Admin or Principal only) Give discount and Reverse payment.

### Full profile
- Admission number, name, photo, date of birth, class, parent name and phone, address, and status (active or left).
- **Built so more fields can be added later** without code changes in many places.

### History timeline
Every event appears in date order, showing who did it and when:
- fee item added, edited or removed
- payment recorded
- discount given
- payment reversed (with the reason)

---

## 4. Student fees

### Fee items
- Each fee is added **per student**. Examples: Tuition 2026–27 ₹24,000, Transport ₹6,000, School tour ₹2,500.
- Each item has a name, an amount, an academic year and an optional due date.
- Staff **cannot** edit or remove an item once it's added. Admin and Principal can, and the change shows in the student's history.

### Payments
- Parents pay **in instalments or random amounts at random times**, so each payment is recorded separately.
- Each payment records the amount, date, method (cash, UPI, card, bank transfer, cheque), a note, and an automatic receipt number. The receipt can be printed.
- **Choosing where the money goes:**
  - You can pick which fee item(s) the payment pays off. Example: a tour fee is added and paid off immediately.
  - If you don't pick, the payment pays the **oldest unpaid fee first**.

### Discounts (Admin and Principal only)
- A discount reduces what the student owes. It has an amount and a reason (for example sibling discount or scholarship).
- It is **shown in the payment history**, clearly labelled as a discount.

### Reversals (Admin and Principal only)
- A wrong payment is **never deleted**. It is marked *reversed*, with a reason and the name of the person who reversed it.
- It **stays visible in the payment history** but no longer counts towards the balance.

### Balance

```
balance = fee items − discounts − payments (not reversed)
```

---

## 5. Staff tab

Works like the Students tab: a list, a quick snapshot, and a full profile.

- **Profile:**
  - photo, name, phone, role or designation, joined date
  - subject(s) taught and classes taught
  - current salary
- **Salary history:** every salary change, with the old amount, the new amount and the date it took effect. This shows when the salary changed and by how much.
- **Salary payments:** for each month, the amount paid, the date, the method and a note. This shows which months are paid and which aren't, including when a payment date moved.
- **Advances:** advance pay or salary given early. These are **not loans** and charge no interest. Whether an advance is subtracted from future salary is an open question.

---

## 6. Finance tab (Admin and Principal)

Tracks all money **coming in and going out**.

### Income
- Student fee payments, which come in automatically from the Students tab.
- Other student charges and other income.

### Expenses
- **Salaries**, which come in automatically from the Staff tab.
- **Purchases**, by category: food, bus fuel, equipment, and any categories the school adds.
- Loan repayments.

### Purchases
- **Paid now:** recorded straight away as an expense.
- **Pay later:**
  - a supplier, a **fixed amount with no interest**, and a due date
  - payments recorded as they're made
  - a list of everything still unpaid

### Loans
- Many loans can be recorded, each with its own:
  - lender or borrower
  - amount and interest rate
  - **interest type: simple or compound**
  - start date and payment dates
- **Late fee:** an option on every loan, **set to 0 by default**.
- **Repayments:** the actual amount and date of each payment are recorded. Each loan shows the amount outstanding and the next due date.

### Dashboard (for a chosen date range)
- Total income and total expenses.
- **Pending student fees**: every unpaid balance for the current academic year.
- What the school still owes on purchases and loans, and what's due this month.

---

## 7. Reports and exports

- Students with pending fees, by class.
- Money collected, by date range, class and payment method.
- Salaries paid.
- Expenses by category.
- Loan and pay-later purchase statements.
- One student's full ledger.
- Export to PDF or Excel.

---

## 8. Not included in this version

- Parent and student logins (decided: no).
- Attendance, exams and marks.
- Notices (keep or remove: open question).

---

## 9. Build order

1. **Foundation:** the three roles, 15 fixed classes, academic years, the Settings tab (promotion date), and the history log.
2. **Students:** list with search and filters, snapshot with the pending/all-paid indicator, profile photo, fee items, payments with a choice of fee item (oldest first by default), discounts, reversals, receipts and the history timeline.
3. **Staff:** profiles, salary history, salary payments and advances.
4. **Finance:** income and expenses, purchases (paid now and pay later), loans (simple or compound interest, late fee option) and the dashboard.
5. **Reports and exports.**
6. **Mobile app:** bring it up to date with all of the above.
