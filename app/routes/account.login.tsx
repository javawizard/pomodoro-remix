import { Button, Card, Input, Link } from '@nextui-org/react';
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import AuthFormLayout from '~/layouts/auth-form';

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
  const [searchParams] = useSearchParams();

  const loginFailed = actionData?.loginFailed;
  const registered = searchParams?.has("registered");

  return (
    // explicitly specify the action in order to nuke the ?registered=true param when the user tries to log in
    <AuthFormLayout action="/account/login">
      <h1 className="text-4xl text-default-800 font-medium mb-4 mt-2">Pomodoro</h1>
      {loginFailed && <div className="text-danger mb-2">Incorrect username or password.</div>}
      {registered && <div className="mb-2">Your account was registered! Please log in below.</div>}
      <Input className="m-2" variant="bordered" name="email" label="Email" />
      <Input className="m-2" variant="bordered" type="password" name="password" label="Password" />
      <Button className="m-2 w-full" color="primary" size="lg" type="submit">Log in</Button>
      <Button className="w-full" as={Link} href="/account/register" size="lg" variant="flat">Sign up</Button>
    </AuthFormLayout>
  );
};
