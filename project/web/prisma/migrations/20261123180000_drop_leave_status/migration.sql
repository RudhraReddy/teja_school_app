-- Leaves are now logged as approved, so the approval workflow columns are removed.
ALTER TABLE "StaffLeave" DROP CONSTRAINT IF EXISTS "StaffLeave_decidedById_fkey";

ALTER TABLE "StaffLeave" DROP COLUMN "decidedAt",
DROP COLUMN "decidedById",
DROP COLUMN "status";

DROP TYPE IF EXISTS "LeaveStatus";
