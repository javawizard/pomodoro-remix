-- CreateEnum
CREATE TYPE "TimerMode" AS ENUM ('FOCUS', 'SHORT_BREAK', 'LONG_BREAK');

-- CreateTable
CREATE TABLE "TimerSession" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "mode" "TimerMode" NOT NULL,
    "timeRemaining" INTEGER,
    "completeAt" TIMESTAMP(3),

    CONSTRAINT "TimerSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TimerSession" ADD CONSTRAINT "TimerSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE RESTRICT;
