import { LINKS } from "@/const";
import { LOCALES } from "@/i18n/routing";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const locale =
    Object.values(LOCALES).find(
      l => pathname.startsWith(`/${l}/`) || pathname === `/${l}`,
    ) ?? LOCALES.PL;

  const pathWithoutLocale =
    pathname.replace(new RegExp(`^/${locale}`), "") || "/";

  const protectedRoutes = [LINKS.APP];
  const guestOnlyRoutes = [
    LINKS.HOME,
    LINKS.LOGIN,
    LINKS.SIGN_UP,
    LINKS.SIGN_UP_SUCCESS,
    LINKS.FORGOT_PASSWORD,
  ];

  const isProtected = protectedRoutes.some(
    route =>
      pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`),
  );
  const isGuestOnly = guestOnlyRoutes.some(
    route => pathWithoutLocale === route,
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${LINKS.LOGIN}`;
    return NextResponse.redirect(url);
  }

  if (isGuestOnly && user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${LINKS.DASHBOARD}`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
