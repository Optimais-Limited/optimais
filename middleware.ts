import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(request) {
    const role = request.nextauth.token?.role;
    const pathname = request.nextUrl.pathname;

    if (pathname.startsWith("/admin") && role !== "ADMIN" && role !== "EDITOR") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => Boolean(token)
    }
  }
);

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"]
};
