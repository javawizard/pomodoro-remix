import { ActionFunctionArgs, json } from "@remix-run/node";
import { prisma } from "~/db.server";
import { requireUser } from "~/services/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);

  await prisma.$transaction(async tx => {
    const activeTimer = await tx.timerSession.findFirst({
      where: { userId: user.id },
      orderBy: { id: 'desc' }
    });

    if (!activeTimer.completeAt) {
      // Timer is paused; nothing to do here
      return;
    }

    await tx.timerSession.update({
      where: { id: activeTimer.id },
      data: {
        completeAt: null,
        timeRemaining: Math.floor(Math.max(0, activeTimer.completeAt.getTime() - Date.now()) / 1000)
      }
    });
  });

  return json({});
}
