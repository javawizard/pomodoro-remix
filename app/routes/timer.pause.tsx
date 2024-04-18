import { ActionFunctionArgs, json } from "@remix-run/node";
import { getActiveTimerSession, pauseTimerSession } from "~/data/timers";
import { prisma } from "~/db.server";
import { requireUser } from "~/services/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);

  await prisma.$transaction(async tx => {
    const activeTimer = await getActiveTimerSession(tx, user);
    await pauseTimerSession(tx, activeTimer);
  });

  return json({});
}
