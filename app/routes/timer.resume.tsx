import { ActionFunctionArgs, json } from "@remix-run/node";
import { add } from "date-fns";
import { prisma } from "~/db.server";
import { requireUser } from "~/services/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);

  await prisma.$transaction(async tx => {
    const activeTimer = await tx.timerSession.findFirst({
      where: { userId: user.id },
      orderBy: { id: 'desc' }
    });

    if (activeTimer.completeAt) {
      // Timer is not paused; nothing to do here
      return;
    }

    await tx.timerSession.update({
      where: { id: activeTimer.id },
      data: {
        timeRemaining: null,
        completeAt: add(new Date(), { seconds: activeTimer.timeRemaining }),
      }
    });
  });

  return json({});
}
