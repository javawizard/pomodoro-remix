/*
  Warnings:

  - You are about to drop the column `defaultLongBreakTime` on the `UserPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `defaultShortBreakTime` on the `UserPreferences` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserPreferences" DROP COLUMN "defaultLongBreakTime",
DROP COLUMN "defaultShortBreakTime",
ADD COLUMN     "defaultBreakTime" INTEGER;
