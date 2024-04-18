import { Card } from "@nextui-org/react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useCallback } from "react";
import { AppNavbar } from "~/components/navbar";
import Timer from "~/components/timer";
import { getActiveTimerSession } from "~/data/timers";
import { prisma } from "~/db.server";

import { requireUser } from "~/services/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Pomodoro" }
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  const activeTimer = await prisma.$transaction(tx => getActiveTimerSession(tx, user));

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
