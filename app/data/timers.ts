import { TimerMode, TimerSession, User } from "@prisma/client";
import { getPreferences } from "./preferences";
import { add } from "date-fns";

export async function getActiveTimerSession(tx, user: User) {
  // Can't upsert because Prisma's upsert method doesn't support ordering and we need to select the most recent timer
  // - so we do the moral equivalent in a transaction instead.
  // Note that we require the caller to pass in their own transaction in case we're being run in the context of a
  // broader transaction because Prisma doesn't yet support nested transactions.
  let activeTimer: TimerSession = await tx.timerSession.findFirst({
    where: { userId: user.id },
    orderBy: { id: 'desc' }
  });

  if (!activeTimer) {
    const preferences = await getPreferences(user);
    const nextTimerDuration = preferences.defaultFocusTime;

    activeTimer = await tx.timerSession.create({
      data: {
        userId: user.id,
        mode: "FOCUS",
        timeRemaining: nextTimerDuration
      }
    });
  }

  return activeTimer;
}

export async function pauseTimerSession(tx, timer: TimerSession) {
  if (!timer.completeAt) {
    // Timer is already paused; nothing to do here
    return;
  }

  await tx.timerSession.update({
    where: { id: timer.id },
    data: {
      completeAt: null,
      timeRemaining: Math.floor(Math.max(0, timer.completeAt.getTime() - Date.now()) / 1000)
    }
  });
}

export async function resumeTimerSession(tx, timer: TimerSession) {
  if (timer.completeAt) {
    // Timer is not paused; nothing to do here
    return;
  }

  await tx.timerSession.update({
    where: { id: timer.id },
    data: {
      timeRemaining: null,
      completeAt: add(new Date(), { seconds: timer.timeRemaining }),
      started: true
    }
  });
}

export async function createNextTimerSession(tx, user: User, previousTimer: TimerSession) {
  // Figure out what mode the new timer should be
  const nextTimerMode: TimerMode = previousTimer.mode == "FOCUS" ? "BREAK" : "FOCUS";

  const preferences = await getPreferences(user);

  // ...and how long it should run for...
  let nextTimerDuration;
  if (nextTimerMode == "FOCUS") {
    nextTimerDuration = preferences.defaultFocusTime;
  } else {
    nextTimerDuration = preferences.defaultBreakTime;
  }

  // ..and then create it.
  return await tx.timerSession.create({
    data: {
      userId: user.id,
      mode: nextTimerMode,
      timeRemaining: nextTimerDuration
    }
  });
}
