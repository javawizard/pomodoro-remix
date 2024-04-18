import { Button, Card, Input, Link } from "@nextui-org/react";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, json, redirect, useActionData, useFetcher, useLoaderData } from "@remix-run/react";
import { useCallback } from "react";
import { AutoClearingErrorInput } from "~/components/auto-clearing-error-input";
import { AppNavbar } from "~/components/navbar";
import Timer from "~/components/timer";
import { getPreferences, savePreferences } from "~/data/preferences";
import { getActiveTimerSession } from "~/data/timers";
import { prisma } from "~/db.server";

import { requireUser } from "~/services/auth.server";

type SavePreferencesErrors = {
  defaultFocusTimeInMinutes?: string,
  defaultBreakTimeInMinutes?: string
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request);

  const data = await request.formData();
  const errors: SavePreferencesErrors = {};

  const defaultFocusTimeInMinutes = data.get("defaultFocusTimeInMinutes") as string;
  const defaultBreakTimeInMinutes = data.get("defaultBreakTimeInMinutes") as string;

  // TODO: this allows strings like "123abc" through and parses them as the number 123; validate against that.
  // (Really it'd be nice to do all of the validation with something like Zod so that there isn't all this hand rolled
  // validation logic everywhere. Ah well. Making that change is left as an exercuse for future me.)
  const parsedDefaultFocusTimeInMinutes = parseInt(defaultFocusTimeInMinutes);
  if (!Number.isInteger(parsedDefaultFocusTimeInMinutes) || parsedDefaultFocusTimeInMinutes < 1) {
    errors.defaultFocusTimeInMinutes = "Please enter a positive number of minutes.";
  }

  const parsedDefaultBreakTimeInMinutes = parseInt(defaultBreakTimeInMinutes);
  if (!Number.isInteger(parsedDefaultBreakTimeInMinutes) || parsedDefaultBreakTimeInMinutes < 1) {
    errors.defaultBreakTimeInMinutes = "Please enter a positive number of minutes.";
  }

  if (Object.keys(errors).length > 0) {
    return json({ errors });
  }

  // No errors, so go ahead and save preferences.
  const preferences = await getPreferences(user);
  preferences.defaultFocusTime = parsedDefaultFocusTimeInMinutes * 60;
  preferences.defaultBreakTime = parsedDefaultBreakTimeInMinutes * 60;
  await savePreferences(preferences);

  return redirect("/");
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  const preferences = await getPreferences(user);

  // heh, maybe we should've stored them as minutes in the first place...
  const defaultFocusTimeInMinutes = `${preferences.defaultFocusTime / 60}`;
  const defaultBreakTimeInMinutes = `${preferences.defaultBreakTime / 60}`;

  return { user, defaultFocusTimeInMinutes, defaultBreakTimeInMinutes };
};

export default function AccountPreferences() {
  const { user, defaultFocusTimeInMinutes, defaultBreakTimeInMinutes } = useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();

  const errors = actionData?.errors || {};
  const defaultFocusTimeInMinutesError = errors.defaultFocusTimeInMinutes;
  const defaultBreakTimeInMinutesError = errors.defaultBreakTimeInMinutes;

  return <div className="min-h-screen flex flex-col">
    <AppNavbar user={user} />
    <div className="flex justify-center">
      <Form method="POST">
        <Card className="flex items-center p-4 mt-28" style={{ minWidth: "30em" }} shadow="lg">
          <h1 className="text-4xl text-default-800 font-medium mb-4 mt-2">Preferences</h1>
          <AutoClearingErrorInput
            className="m-2"
            variant="bordered"
            name="defaultFocusTimeInMinutes"
            label="Focus time"
            defaultValue={defaultFocusTimeInMinutes}
            endContent={<div className="pointer-events-none flex items-center justify-center">
              <span className="text-default-400 text-small">minutes</span>
            </div>}
            errorMessage={defaultFocusTimeInMinutesError}
          />
          <AutoClearingErrorInput
            className="m-2"
            variant="bordered"
            name="defaultBreakTimeInMinutes"
            label="Break time"
            defaultValue={defaultBreakTimeInMinutes}
            endContent={<div className="pointer-events-none flex items-center justify-center">
              <span className="text-default-400 text-small">minutes</span>
            </div>}
            errorMessage={defaultBreakTimeInMinutesError}
          />
          <div className="mt-2 w-full flex justify-end gap-2">
            <Button as={Link} href="/" variant="light">Cancel</Button>
            <Button type="submit" color="primary">Save</Button>
          </div>
        </Card>
      </Form>
    </div>
  </div>;

}
