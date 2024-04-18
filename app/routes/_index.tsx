import { Button, Card } from "@nextui-org/react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import { add } from "date-fns";
import { useCallback } from "react";
import { AppNavbar } from "~/components/navbar";
import Timer from "~/components/timer";
import { getPreferences } from "~/data/preferences";
import { prisma } from "~/db.server";

import { requireUser } from "~/services/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Pomodoro" }
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  let activeTimer;

  await prisma.$transaction(async tx => {
    // Can't upsert because Prisma's upsert method doesn't support ordering and we need to select the most recent timer
    // - so we do the moral equivalent in a transaction instead.
    activeTimer = await tx.timerSession.findFirst({
      where: { user },
      orderBy: { id: 'desc' }
    });

    if (!activeTimer) {
      const preferences = await getPreferences(user);
      const nextTimerDuration = preferences.defaultFocusTime;

      // TODO: create the timer in paused mode (and probably flag that it hasn't started yet so we can render the
      // "resume" button as "start" instead, and maybe do the same thing when we create timers in timer.next.tsx)
      activeTimer = await tx.timerSession.create({
        data: {
          userId: user.id,
          mode: "FOCUS",
          timeRemaining: nextTimerDuration
        }
      });
    }
  });

  return { user, activeTimer };
};

export default function Index() {
  const { user, activeTimer } = useLoaderData();

  const fetcher = useFetcher();

  const onPause = useCallback(() => {
    fetcher.submit({}, { "method": "POST", "action": "/timer/pause" })
  }, [fetcher]);
  const onResume = useCallback(() => {
    fetcher.submit({}, { "method": "POST", "action": "/timer/resume" })
  }, [fetcher]);
  const onNext = useCallback(() => {
    fetcher.submit({}, { "method": "POST", "action": "/timer/next" })
  }, [fetcher]);

  return <div className="min-h-screen flex flex-col">
    <AppNavbar user={user} />
    <div className="flex justify-center">
      <Card className="flex items-center p-4 mt-28" style={{ minWidth: "30em" }} shadow="lg">
        <Timer
          completeAt={activeTimer.completeAt && new Date(activeTimer.completeAt)}
          timeRemaining={activeTimer.timeRemaining}
          started={activeTimer.started}
          mode={activeTimer.mode}
          onPause={onPause}
          onResume={onResume}
          onNext={onNext}
        />
      </Card>
    </div>
  </div>;

}
