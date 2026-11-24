import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "./errors";

/** Converts any thrown error into a { status, message, details } shape. */
export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;
  if (err instanceof ZodError) {
    const first = err.issues[0];
    return new AppError(400, first?.message ?? "Invalid input", err.flatten().fieldErrors);
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const fields = (err.meta?.target as string[] | undefined)?.join(", ");
      return new AppError(409, `A record with this ${fields ?? "value"} already exists`);
    }
    if (err.code === "P2025") return new AppError(404, "Record not found");
    if (err.code === "P2003") return new AppError(400, "A linked record does not exist");
  }
  console.error(err);
  return new AppError(500, "Something went wrong. Please try again.");
}

type Ctx<P> = { params: Promise<P> };

export function route<P = Record<string, never>>(fn: (req: Request, params: P) => Promise<unknown>) {
  return async (req: Request, ctx: Ctx<P>) => {
    try {
      const result = await fn(req, await ctx.params);
      if (result instanceof Response) return result;
      return NextResponse.json(result ?? { ok: true });
    } catch (err) {
      const e = toAppError(err);
      return NextResponse.json({ error: e.message, details: e.details }, { status: e.status });
    }
  };
}

export async function body(req: Request) {
  try {
    return await req.json();
  } catch {
    throw new AppError(400, "Request body must be JSON");
  }
}
