import { updateSession } from "@/lib/supabase/proxy";
import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const sessionResponse = await updateSession(request);

  if (sessionResponse.status !== 200) return sessionResponse;

  const response = intlMiddleware(request);
  sessionResponse.cookies
    .getAll()
    .forEach(cookie => response.cookies.set(cookie));

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (route handlers, e.g. the Supabase auth webhook - not locale-prefixed pages)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
