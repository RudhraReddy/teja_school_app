import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // API: allow cross-origin calls (Expo web / dev tools). Auth is enforced per route.
  if (req.nextUrl.pathname.startsWith("/api/")) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
    if (req.method === "OPTIONS") return new NextResponse(null, { status: 204, headers: cors });
    const res = NextResponse.next();
    Object.entries(cors).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.svg$).*)"],
};
