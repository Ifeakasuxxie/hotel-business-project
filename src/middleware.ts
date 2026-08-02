import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/edge";

const PROTECTED_PAGES = ["/dashboard", "/profile", "/admin", "/bookings"];

const PROTECTED_APIS: Array<{ prefix: string; methods: string[] }> = [
  { prefix: "/api/bookings", methods: ["POST"] },
  { prefix: "/api/payments", methods: ["POST"] },
  { prefix: "/api/reviews", methods: ["POST"] },
  { prefix: "/api/restaurant/orders", methods: ["POST"] },
  { prefix: "/api/users", methods: ["GET", "PUT", "PATCH", "DELETE"] },
];

function isProtectedApi(pathname: string, method: string): boolean {
  return PROTECTED_APIS.some(
    ({ prefix, methods }) =>
      methods.includes(method) &&
      (pathname === prefix || pathname.startsWith(`${prefix}/`)),
  );
}

function isProtectedPage(pathname: string): boolean {
  return PROTECTED_PAGES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export default auth((request) => {
  const response = NextResponse.next();
  response.headers.set("x-request-id", crypto.randomUUID());

  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();
  const isAuthed = Boolean(request.auth?.user);

  if (pathname.startsWith("/api/")) {
    if (isProtectedApi(pathname, method) && !isAuthed) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
          code: "UNAUTHORIZED",
        },
        { status: 401 },
      );
    }
    return response;
  }

  if (isProtectedPage(pathname) && !isAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
});

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/bookings/:path*",
  ],
};
