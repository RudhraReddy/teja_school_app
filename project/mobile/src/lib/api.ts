import Constants from "expo-constants";

/** Server address: EXPO_PUBLIC_API_URL at build time, else app.json `extra.apiUrl`. Can be changed on the sign-in screen. */
export const DEFAULT_API_URL: string =
  process.env.EXPO_PUBLIC_API_URL ?? (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? "http://localhost:3000";

let baseUrl = DEFAULT_API_URL;
let token: string | null = null;
let onUnauthorized: (() => void) | null = null;

export const api = {
  setBaseUrl: (url: string) => (baseUrl = url.replace(/\/+$/, "")),
  getBaseUrl: () => baseUrl,
  setToken: (t: string | null) => (token = t),
  setOnUnauthorized: (fn: (() => void) | null) => (onUnauthorized = fn),
};

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: Record<string, string[]>) {
    super(message);
  }
}

export async function request<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${baseUrl}/api/v1${path}`, {
      method: init.method ?? "GET",
      headers: {
        Accept: "application/json",
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new ApiError(0, `Can't reach the school server at ${baseUrl}. Check your internet connection.`);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized?.();
    throw new ApiError(res.status, data.error ?? `Request failed (${res.status})`, data.details);
  }
  return data as T;
}

// ---- Response types (mirror the web API)
export type Role = "ADMIN" | "TEACHER";
export interface User { id: string; name: string; email: string; role: Role }
export interface ClassRef { id: string; name: string; section: string }
export interface Student {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  guardianName: string | null;
  guardianPhone: string | null;
  address: string | null;
  status: "ACTIVE" | "INACTIVE";
  classId: string | null;
  class: (ClassRef & { classTeacher?: { id: string; name: string } | null }) | null;
}
export interface SchoolClass extends ClassRef {
  room: string | null;
  classTeacher: { id: string; name: string } | null;
  _count: { students: number };
}
export interface ClassDetail extends ClassRef {
  room: string | null;
  classTeacher: { id: string; name: string; phone: string | null } | null;
  students: Student[];
}
export interface Notice {
  id: string;
  title: string;
  body: string;
  audience: "ALL" | "TEACHERS";
  pinned: boolean;
  createdAt: string;
  author: { id: string; name: string } | null;
}
export interface FeeItem { id: string; name: string; amount: number; dueDate: string | null }
export interface Payment {
  id: string;
  receiptNo: string;
  amount: number;
  method: string;
  paidOn: string;
  note: string | null;
  feeItem: { id: string; name: string } | null;
}
export interface FeeSummary {
  breakdown: { item: FeeItem; paid: number; balance: number }[];
  payments: Payment[];
  totalDue: number;
  totalPaid: number;
  balance: number;
}
export interface Balance {
  student: { id: string; admissionNo: string; firstName: string; lastName: string; class: { name: string; section: string } | null };
  due: number;
  paid: number;
  balance: number;
}
export interface Dashboard {
  students: number;
  classes: number;
  teachers: number;
  collectedThisMonth: number;
  outstanding: number;
  studentsWithDues: number;
  recentNotices: Notice[];
}
