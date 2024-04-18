/*
  Warnings:

  - Made the column `defaultFocusTime` on table `UserPreferences` required. This step will fail if there are existing NULL values in that column.
  - Made the column `defaultBreakTime` on table `UserPreferences` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UserPreferences" ALTER COLUMN "defaultFocusTime" SET NOT NULL,
ALTER COLUMN "defaultFocusTime" SET DEFAULT 1500,
ALTER COLUMN "defaultBreakTime" SET NOT NULL,
ALTER COLUMN "defaultBreakTime" SET DEFAULT 300;
