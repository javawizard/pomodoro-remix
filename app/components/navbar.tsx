import { Button, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react";
import { Form, useSubmit } from "@remix-run/react";
import { useCallback } from "react";

export function AppNavbar({ user }) {
  const submit = useSubmit();

  return <Navbar>
    <NavbarContent justify="start">
      <NavbarBrand>
        <p className="font-medium text-2xl">Pomodoro</p>
      </NavbarBrand>
    </NavbarContent>
    <NavbarContent justify="end" className="gap-2">
      <NavbarItem className="mr-2">
        <p>Signed in as <span className="font-bold">{user.name}</span></p>
      </NavbarItem>
      <NavbarItem>
        <Button as={Link} href="/account/preferences" variant="bordered">Preferences</Button>
      </NavbarItem>
      <NavbarItem>
        <Form method="POST" action="/account/logout">
          <Button type="submit" variant="light" color="danger">Log out</Button>
        </Form>
      </NavbarItem>
    </NavbarContent>
  </Navbar>
}
