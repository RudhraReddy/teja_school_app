-- Students: several phone numbers and notes.
ALTER TABLE "Student" ADD COLUMN "guardianPhones" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
UPDATE "Student" SET "guardianPhones" = ARRAY["guardianPhone"] WHERE "guardianPhone" IS NOT NULL AND "guardianPhone" <> '';
ALTER TABLE "Student" DROP COLUMN "guardianPhone";
ALTER TABLE "Student" ADD COLUMN "notes" TEXT;

-- Fees belong to one student. Old class-wide and school-wide fees are copied onto each student they applied to.
ALTER TABLE "FeeItem" ADD COLUMN "studentId" TEXT;

CREATE TEMP TABLE "_fee_map" AS
SELECT f."id" AS old_id, s."id" AS student_id, gen_random_uuid()::text AS new_id
FROM "FeeItem" f
JOIN "Student" s ON f."classId" IS NULL OR s."classId" = f."classId"
WHERE f."studentId" IS NULL;

INSERT INTO "FeeItem" ("id", "studentId", "name", "amount", "dueDate", "createdAt")
SELECT m.new_id, m.student_id, f."name", f."amount", f."dueDate", f."createdAt"
FROM "_fee_map" m
JOIN "FeeItem" f ON f."id" = m.old_id;

-- Point existing payments at the student's own copy of the fee.
UPDATE "FeePayment" p
SET "feeItemId" = m.new_id
FROM "_fee_map" m
WHERE p."feeItemId" = m.old_id AND p."studentId" = m.student_id;

-- Remove the old shared fee rows.
DELETE FROM "FeeItem" WHERE "studentId" IS NULL;

DROP TABLE "_fee_map";

ALTER TABLE "FeeItem" DROP CONSTRAINT IF EXISTS "FeeItem_classId_fkey";
ALTER TABLE "FeeItem" DROP COLUMN "classId";
ALTER TABLE "FeeItem" ALTER COLUMN "studentId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "FeeItem_studentId_idx" ON "FeeItem"("studentId");

-- AddForeignKey
ALTER TABLE "FeeItem" ADD CONSTRAINT "FeeItem_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
