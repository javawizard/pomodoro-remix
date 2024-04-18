import { TimerMode } from "@prisma/client";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { add } from "date-fns";
import { getPreferences } from "~/data/preferences";
import { prisma } from "~/db.server";
import { requireUser } from "~/services/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);

  await prisma.$transaction(async tx => {
    const activeTimer = await tx.timerSession.findFirst({
      where: { userId: user.id },
      orderBy: { id: 'desc' }
    });

    if (activeTimer.completeAt && activeTimer.completeAt > Date.now()) {
      // The timer's completion date is in the future so it's still running; pause it before deactivating it
      await tx.timerSession.update({
        where: { id: activeTimer.id },
        data: { completeAt: null, timeRemaining: Math.floor(Math.max(0, activeTimer.completeAt.getTime() - Date.now()) / 1000) }
      })
    }

    // Then figure out what mode the new timer should be and how long it should run for
    const nextTimerMode: TimerMode = activeTimer.mode == "FOCUS" ? "BREAK" : "FOCUS";

    const preferences = await getPreferences(user);

    let nextTimerDuration;
    if (nextTimerMode == "FOCUS") {
      nextTimerDuration = preferences.defaultFocusTime;
    } else {
      nextTimerDuration = preferences.defaultBreakTime;
    }

    // Then create it and we're done!
    await tx.timerSession.create({
      data: {
        userId: user.id,
        mode: nextTimerMode,
        timeRemaining: nextTimerDuration
      }
    })
  });

  return json({});
}
