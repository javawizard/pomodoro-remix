import { TimerMode } from "@prisma/client";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { add } from "date-fns";
import { getPreferences } from "~/data/preferences";
import { createNextTimerSession, getActiveTimerSession, pauseTimerSession } from "~/data/timers";
import { prisma } from "~/db.server";
import { requireUser } from "~/services/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);

  await prisma.$transaction(async tx => {
    const activeTimer = await getActiveTimerSession(tx, user);

    if (activeTimer.completeAt && activeTimer.completeAt > new Date()) {
      // The timer's completion date is in the future so it's still running; pause it before deactivating it
      await pauseTimerSession(tx, activeTimer);
    }

    await createNextTimerSession(tx, user, activeTimer);
  });

  return json({});
}
