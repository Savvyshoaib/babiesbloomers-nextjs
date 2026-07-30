import { NextResponse, type NextRequest } from "next/server";
import { decrypt } from "@/lib/session";

const SESSION_COOKIE = "bb_session";

const protectedRoutes = ["/account", "/admin"];
const authRoutes = ["/sign-in", "/sign-up", "/forgot-password"];

/** Prevent browsers / CDN from serving stale HTML for the public storefront. */
function withNoStoreHtml(response: NextResponse) {
  response.headers.set(
    "Cache-Control",
    "private, no-cache, no-store, max-age=0, must-revalidate",
  );
  response.headers.set("CDN-Cache-Control", "no-store");
  response.headers.set("Vercel-CDN-Cache-Control", "no-store");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await decrypt(sessionToken);
  const isLoggedIn = !!session;

  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isProtected && !isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  if (isAuthRoute && isLoggedIn) {
    const redirectTo = request.nextUrl.searchParams.get("redirect");
    if (redirectTo?.startsWith("/")) {
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    return NextResponse.redirect(new URL("/account", request.url));
  }

  // Always-fresh HTML for customers (and staff browsing the storefront).
  return withNoStoreHtml(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
