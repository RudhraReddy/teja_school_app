import { db } from "../db";
import { AppError, notFound } from "../errors";
import { checkPassword, hashPassword, type CurrentUser } from "../auth";
import { signToken } from "../token";
import { loginSchema, userCreateSchema, userUpdateSchema } from "../validators";
import { assertAdmin } from "./guard";

const publicUser = { id: true, name: true, email: true, phone: true, role: true, active: true, createdAt: true } as const;

export async function login(input: unknown) {
  const { email, password } = loginSchema.parse(input);
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.active || !(await checkPassword(password, user.passwordHash))) {
    throw new AppError(401, "Incorrect email or password");
  }
  const token = await signToken({ sub: user.id, role: user.role, name: user.name });
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

export async function listUsers(me: CurrentUser) {
  assertAdmin(me);
  return db.user.findMany({
    select: { ...publicUser, classesTaught: { select: { id: true, name: true, section: true } } },
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });
}

export async function listTeachersForSelect() {
  return db.user.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } });
}

export async function createUser(me: CurrentUser, input: unknown) {
  assertAdmin(me);
  const data = userCreateSchema.parse(input);
  const { password, ...rest } = data;
  return db.user.create({ data: { ...rest, passwordHash: await hashPassword(password) }, select: publicUser });
}

export async function updateUser(me: CurrentUser, id: string, input: unknown) {
  assertAdmin(me);
  const { password, ...rest } = userUpdateSchema.parse(input);
  if (id === me.id && (rest.active === false || rest.role === "TEACHER")) {
    throw new AppError(400, "You cannot deactivate or demote your own account");
  }
  const exists = await db.user.findUnique({ where: { id }, select: { id: true } });
  if (!exists) throw notFound("User");
  return db.user.update({
    where: { id },
    data: { ...rest, ...(password ? { passwordHash: await hashPassword(password) } : {}) },
    select: publicUser,
  });
}
