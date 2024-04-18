import argon2 from 'argon2';
import { createCookieSessionStorage, redirect } from "@remix-run/node";

import { prisma } from '~/db.server';

// This is used to encrypt session cookies on the client side. In dev mode we use a hardcoded string; in production,
// you'll want to generate a random string with e.g. `openssl rand -hex 64` and then make it available in the
// SESSION_SECRET environment variable.
let SESSION_SECRET;
if (process.env.NODE_ENV == "development") {
  SESSION_SECRET = "dev-mode-secret";
} else {
  SESSION_SECRET = process.env.SESSION_SECRET;
  if (!SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be set in non-development environments");
  }
}

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "pomodoro_session",
    secure: process.env.NODE_ENV === "production", // don't restrict to HTTPS-only in development
    sameSite: "lax",
    secrets: [SESSION_SECRET],
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30 // expire session after 30 days
  },
});

async function getSession(request: Request) {
  return await sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function register({ name, email, password }: { name: string, email: string, password: string }) {
  const hashedPassword: string = await argon2.hash(password);

  return await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword
    }
  });
}

export async function loginAndRedirect(request: Request, email: string, password: string, redirectTo: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return null;
  }

  if (!await argon2.verify(user.hashedPassword, password)) {
    return null;
  }

  const session = await getSession(request);
  session.set("userId", user.id);
  throw redirect(redirectTo, {
    headers: { "Set-Cookie": await sessionStorage.commitSession(session) }
  });
}

export async function logoutAndRedirect(request: Request, redirectTo: string) {
  const session = await getSession(request);
  throw redirect(redirectTo, {
    headers: { "Set-Cookie": await sessionStorage.destroySession(session) }
  });
}

export async function getUserIfLoggedIn(request: Request) {
  const session = await getSession(request);

  const userId = session.get("userId");
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return null;
  }

  return user;
}

export async function requireUser(request: Request) {
  const user = await getUserIfLoggedIn(request);
  if (!user) {
    throw redirect("/account/login");
  }

  return user;
}
