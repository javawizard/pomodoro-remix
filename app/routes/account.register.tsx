import { Button } from "@nextui-org/react";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { AutoClearingErrorInput } from "~/components/auto-clearing-error-input";
import { PASSWORD_MINIMUM_LENGTH } from "~/constants";
import { urlWithParams } from "~/helpers/routing";
import AuthFormLayout from "~/layouts/auth-form";
import { register } from "~/services/auth.server";

type RegisterAccountErrors = {
  email?: string,
  name?: string,
  password?: string
};

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.formData();
  const errors: RegisterAccountErrors = {};

  const name = data.get("name") as string;
  const email = data.get("email") as string;
  const password = data.get("password") as string;

  // Check to see if the name or email were left blank; note that the empty string is falsey in JavaScript
  if (!name) {
    errors['name'] = "Name is required.";
  }
  if (!email) {
    errors['email'] = "Email is required.";
  }

  // Check to see if the password is too short
  if (password.length < PASSWORD_MINIMUM_LENGTH) {
    errors['password'] = "Password is too short.";
  }

  // Bail if any of the above failed
  if (Object.keys(errors).length > 0) {
    return json({ errors });
  }

  // Everything's looking good; try to register the user
  const success = await register({ email, name, password });
  if (!success) {
    // A user with that email already exists
    return { errors: { email: "This email is already registered." } };
  }

  // Registration is complete!
  return redirect(urlWithParams("/account/login", { registered: 'true' }));
}

export default function Register() {
  const actionData = useActionData<typeof action>();

  const errors = actionData?.errors || {};
  const nameError = errors.name;
  const emailError = errors.email;
  const passwordError = errors.password;

  return <AuthFormLayout>
    <h1 className="text-4xl text-default-800 font-medium mb-4 mt-2">Sign up</h1>
    <AutoClearingErrorInput className="m-2" variant="bordered" name="name" label="Name" placeholder="Jane Doe" errorMessage={nameError} />
    <AutoClearingErrorInput className="m-2" variant="bordered" name="email" label="Email" placeholder="jane@example.com" errorMessage={emailError} />
    <AutoClearingErrorInput className="m-2" variant="bordered" type="password" name="password" placeholder="correct horse battery staple" label="Password" errorMessage={passwordError} />
    <Button className="m-2 w-full" color="primary" size="lg" type="submit">Sign up</Button>
  </AuthFormLayout>;
}
