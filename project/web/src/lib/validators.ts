import { z } from "zod";

// Form fields arrive as strings; treat "" as "not provided".
const blankToUndef = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);
const optText = z.preprocess(blankToUndef, z.string().trim().max(500).optional().nullable());
const optId = z.preprocess(blankToUndef, z.string().optional().nullable());
const optDate = z.preprocess(blankToUndef, z.coerce.date().optional().nullable());
const checkbox = z.preprocess((v) => v === true || v === "on" || v === "true", z.boolean());

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export const userCreateSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: optText,
  role: z.enum(["ADMIN", "TEACHER"]).default("TEACHER"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const userUpdateSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: optText,
  role: z.enum(["ADMIN", "TEACHER"]).optional(),
  active: z.boolean().optional(),
  password: z.preprocess(blankToUndef, z.string().min(8, "Password must be at least 8 characters").optional()),
});

export const classSchema = z.object({
  name: z.string().trim().min(1, "Class name is required").max(50),
  section: z.preprocess(blankToUndef, z.string().trim().max(10).default("A")),
  room: optText,
  classTeacherId: optId,
});

export const studentSchema = z.object({
  admissionNo: z.string().trim().min(1, "Admission number is required").max(30),
  firstName: z.string().trim().min(1, "First name is required").max(60),
  lastName: z.string().trim().min(1, "Last name is required").max(60),
  dateOfBirth: optDate,
  gender: z.preprocess(blankToUndef, z.enum(["MALE", "FEMALE", "OTHER"]).optional().nullable()),
  guardianName: optText,
  guardianPhones: z.array(z.string().trim().max(20)).default([]).transform((list) => list.filter((p) => p !== "")),
  notes: optText,
  address: optText,
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  classId: optId,
});

export const noticeSchema = z.object({
  title: z.string().trim().min(3, "Title is required").max(150),
  body: z.string().trim().min(1, "Message is required").max(5000),
  audience: z.enum(["ALL", "TEACHERS"]).default("ALL"),
  pinned: checkbox.default(false),
});

export const feeItemSchema = z.object({
  name: z.string().trim().min(2, "Fee name is required").max(100),
  amount: z.coerce.number().int("Use whole rupees").positive("Amount must be more than 0"),
  dueDate: optDate,
});

/** Creating a student can also add fees to them straight away. */
export const studentCreateSchema = studentSchema.extend({
  fees: z.array(feeItemSchema).default([]),
});

export const paymentSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  feeItemId: optId,
  amount: z.coerce.number().int("Use whole rupees").positive("Amount must be more than 0"),
  method: z.enum(["CASH", "UPI", "CARD", "BANK_TRANSFER", "CHEQUE"]).default("CASH"),
  paidOn: optDate,
  note: optText,
});

export const staffSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  gender: z.preprocess(blankToUndef, z.enum(["MALE", "FEMALE", "OTHER"]).optional().nullable()),
  dateOfBirth: optDate,
  joiningDate: z.coerce.date({ error: "Joining date is required" }),
  subject: optText,
  monthlySalary: z.coerce.number().int("Use whole rupees").min(0, "Salary cannot be negative"),
});

export const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Pick a valid month");

export const salaryPaymentSchema = z.object({
  staffId: z.string().min(1, "Staff member is required"),
  forMonth: monthSchema,
  amount: z.coerce.number().int("Use whole rupees").positive("Amount must be more than 0"),
  method: z.enum(["CASH", "UPI", "CARD", "BANK_TRANSFER", "CHEQUE"]).default("BANK_TRANSFER"),
  paidOn: optDate,
  note: optText,
});

export const leaveSchema = z
  .object({
    staffId: z.string().min(1, "Staff member is required"),
    startDate: z.coerce.date({ error: "Start date is required" }),
    endDate: z.coerce.date({ error: "End date is required" }),
    isPaid: checkbox.default(false),
    reason: optText,
  })
  .refine((v) => v.endDate >= v.startDate, { message: "End date cannot be before start date", path: ["endDate"] });

export const loanSchema = z.object({
  direction: z.enum(["BORROWED", "LENT"]).default("BORROWED"),
  counterparty: z.string().trim().min(2, "Name of the bank or person is required").max(120),
  principal: z.coerce.number().int("Use whole rupees").positive("Amount must be more than 0"),
  annualRate: z.coerce.number().min(0, "Rate cannot be negative").max(100, "Rate looks too high"),
  interestType: z.enum(["SIMPLE", "COMPOUND"]).default("SIMPLE"),
  startDate: z.coerce.date({ error: "Start date is required" }),
  frequency: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]).default("MONTHLY"),
  firstDueDate: optDate,
  lateFeePercent: z.preprocess(blankToUndef, z.coerce.number().min(0, "Late fee cannot be negative").max(100).default(0)),
  installment: z.preprocess(blankToUndef, z.coerce.number().int("Use whole rupees").positive("Monthly payment must be more than 0").optional().nullable()),
  note: optText,
});

export const loanRepaymentSchema = z.object({
  loanId: z.string().min(1, "Loan is required"),
  amount: z.coerce.number().int("Use whole rupees").positive("Amount must be more than 0"),
  method: z.enum(["CASH", "UPI", "CARD", "BANK_TRANSFER", "CHEQUE"]).default("BANK_TRANSFER"),
  paidOn: optDate,
  note: optText,
});

export type StudentInput = z.infer<typeof studentSchema>;
