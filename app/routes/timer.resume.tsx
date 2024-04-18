import { ActionFunctionArgs, json } from "@remix-run/node";
import { add } from "date-fns";
import { getActiveTimerSession, resumeTimerSession } from "~/data/timers";
import { prisma } from "~/db.server";
import { requireUser } from "~/services/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);

  await prisma.$transaction(async tx => {
    const activeTimer = await getActiveTimerSession(tx, user);
    await resumeTimerSession(tx, activeTimer);
  });

  return json({});
}
