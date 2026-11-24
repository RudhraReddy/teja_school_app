import { NextResponse } from "next/server";
import { body, route } from "@/lib/api";
import { login } from "@/lib/services/users";
import { SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/token";

export const POST = route(async (req) => {
  const result = await login(await body(req));
  const res = NextResponse.json(result);
  res.cookies.set(SESSION_COOKIE, result.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });
  return res;
});
