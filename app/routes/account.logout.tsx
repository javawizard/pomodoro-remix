import { ActionFunctionArgs } from "@remix-run/node";
import { logoutAndRedirect } from "~/services/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  await logoutAndRedirect(request, "/account/login");
}
