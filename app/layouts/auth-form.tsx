// Common layout for authentication-related pages that use forms, all of which are rendered in a card that's centered

import { Card } from "@nextui-org/react";
import { Form } from "@remix-run/react";
import { PropsWithChildren } from "react";

// on the page
export default function AuthFormLayout({ action, children }: PropsWithChildren<{ action?: string }>) {
  return <div className="h-screen flex items-center justify-center">
    <Form method="POST" className="flex items-center" action={action}>
      <Card className="flex items-center p-4" style={{ minWidth: "30em" }} shadow="lg">
        {children}
      </Card>
    </Form>
  </div>;
}
