import { Button, Card, Input } from '@nextui-org/react';
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Form, useActionData } from "@remix-run/react";

import { getUserIfLoggedIn, loginAndRedirect } from '~/services/auth.server';

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.formData();

  await loginAndRedirect(request, data.get("email"), data.get("password"), "/");
  return { loginFailed: true };
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Redirect to the home page if the user is already logged in
  if (await getUserIfLoggedIn(request)) {
    return redirect("/");
  }

  return null;
}

export default function Login() {
  const actionData = useActionData<typeof action>();

  const loginFailed = actionData?.loginFailed;

  return (
    <div className="h-screen flex items-center justify-center">
      <Form method="POST" className="flex items-center">
        <Card className="flex items-center p-4" style={{ minWidth: "30em" }} shadow="lg">
          <h1 className="text-4xl text-default-800 font-medium mb-4 mt-2">Pomodoro</h1>
          {loginFailed && <div className="text-danger mb-2">Incorrect username or password.</div>}
          <Input className="m-2" variant="bordered" name="email" label="Email" />
          <Input className="m-2" variant="bordered" type="password" name="password" label="Password" />
          <Button className="m-2 w-full" color="primary" size="lg" type="submit">Log in</Button>
        </Card>
      </Form>
    </div>
  );
};
