import { notFound } from "next/navigation";
import { AppError } from "./errors";

/** Runs a loader and turns a 404 AppError into Next's not-found page. */
export async function loadOr404<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof AppError && err.status === 404) notFound();
    throw err;
  }
}
