import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./lib/jwt";
import { ROLE_HOME, ROLE_PREFIXES } from "./lib/roles";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const matchedPrefix = ROLE_PREFIXES.find(({ prefix }) =>
    pathname.startsWith(prefix)
  );
  if (!matchedPrefix) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session.role !== matchedPrefix.role) {
    return NextResponse.redirect(new URL(ROLE_HOME[session.role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/accountant/:path*", "/parent/:path*"],
};
