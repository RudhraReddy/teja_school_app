import "server-only";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { forbidden, unauthorized } from "./errors";
import { SESSION_COOKIE, verifyToken, type Role } from "./token";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

/**
 * LOCAL DEVELOPMENT ONLY. With AUTH_BYPASS=true there is no login: every request acts as the
 * first active admin in the database. Ignored in production builds.
 */
const AUTH_BYPASS = process.env.AUTH_BYPASS === "true" && process.env.NODE_ENV !== "production";

export const hashPassword = (pw: string) => bcrypt.hash(pw, 10);
export const checkPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

/** Reads the session from the Authorization header (mobile) or the session cookie (web). */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (AUTH_BYPASS) {
    const admin = await db.user.findFirst({
      where: { role: "ADMIN", active: true },
      select: { id: true, name: true, email: true, role: true },
    });
    if (admin) return admin;
  }
  const authHeader = (await headers()).get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  // Re-check the database so deactivated accounts lose access immediately.
  const user = await db.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, role: true, active: true },
  });
  if (!user || !user.active) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

/** For API routes and services: throws 401/403. */
export async function requireUser(role?: Role): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw unauthorized();
  if (role && user.role !== role) throw forbidden();
  return user;
}

/** For web pages: throws 401 when there is no user, redirects to the students list on a role mismatch. */
export async function requirePageUser(role?: Role): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw unauthorized();
  if (role && user.role !== role) redirect("/students");
  return user;
}
