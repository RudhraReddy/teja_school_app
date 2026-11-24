import type { CurrentUser } from "../auth";
import { forbidden } from "../errors";

export function assertAdmin(me: CurrentUser) {
  if (me.role !== "ADMIN") throw forbidden();
}
