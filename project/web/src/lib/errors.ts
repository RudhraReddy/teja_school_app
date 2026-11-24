export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export const unauthorized = () => new AppError(401, "Please sign in");
export const forbidden = () => new AppError(403, "You do not have permission to do this");
export const notFound = (what = "Record") => new AppError(404, `${what} not found`);
