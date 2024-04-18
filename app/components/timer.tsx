import { Button } from "@nextui-org/react";
import { TimerMode } from "@prisma/client";
import { useEffect, useState } from "react";

type Props = {
  timeRemaining?: number,
  completeAt?: Date,
  started: boolean,
  onPause: () => unknown,
  onResume: () => unknown,
  onNext: () => unknown,
  mode: TimerMode
}

export default function Timer({ timeRemaining, completeAt, started, onPause, onResume, onNext, mode }: Props) {
  const [displayedTimeRemaining, setDisplayedTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (completeAt) {
      const updateTimeRemaining = () => {
        const remainingSeconds = Math.floor(Math.max(0, completeAt.getTime() - Date.now()) / 1000);
        setDisplayedTimeRemaining(remainingSeconds);
      };

      updateTimeRemaining();
      const interval = setInterval(updateTimeRemaining, 1000); // future optimization: cancel the interval once the timer completes

      return () => {
        clearInterval(interval);
      }
    } else if (timeRemaining) {
      setDisplayedTimeRemaining(timeRemaining);
    } else {
      setDisplayedTimeRemaining(null);
    }
  }, [timeRemaining, completeAt]);

  const isPaused = !completeAt;
  const isComplete = completeAt && displayedTimeRemaining === 0;

  let nextButtonLabel;
  if (!isComplete) {
    nextButtonLabel = "Skip";
  } else if (mode == "FOCUS") {
    nextButtonLabel = "Start break";
  } else {
    nextButtonLabel = "Start focus time";
  }

  let displayedMinutes = "--";
  let displayedSeconds = "--";

  if (displayedTimeRemaining !== null) {
    displayedMinutes = `${Math.floor(displayedTimeRemaining / 60)}`;
    displayedSeconds = `${displayedTimeRemaining % 60}`.padStart(2, '0');
  }

  return <div className="flex flex-col min-w-full items-center">
    <div className="text-7xl font-medium text-foreground-800 m-2">
      {displayedMinutes}:{displayedSeconds}
    </div>
    <div className="m-1">
      {mode == "FOCUS" ? "It's focus time" : "It's break time"}
    </div>
    <div className="flex mt-2 m-1 gap-2">
      {isPaused && <Button onPress={onResume} variant="ghost" color="primary">{started ? "Resume" : "Start"}</Button>}
      {!isPaused && !isComplete && <Button onPress={onPause} variant="ghost">Pause</Button>}
      <Button onPress={onNext} variant="ghost">{nextButtonLabel}</Button>
    </div>
  </div>;
}

