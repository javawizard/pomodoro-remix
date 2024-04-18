/*
  Warnings:

  - The values [SHORT_BREAK,LONG_BREAK] on the enum `TimerMode` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TimerMode_new" AS ENUM ('FOCUS', 'BREAK');
ALTER TABLE "TimerSession" ALTER COLUMN "mode" TYPE "TimerMode_new" USING ("mode"::text::"TimerMode_new");
ALTER TYPE "TimerMode" RENAME TO "TimerMode_old";
ALTER TYPE "TimerMode_new" RENAME TO "TimerMode";
DROP TYPE "TimerMode_old";
COMMIT;
