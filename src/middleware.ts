// middleware.ts
import { NextResponse } from "next/server";

export function middleware() {
  const response = NextResponse.next();

  // Add security headers
  response.headers.set(
    "Content-Security-Policy",
    `frame-ancestors 'self' ${process.env.WORDPRESS_SITE_URL};`
  );

  return response;
}

export const config = {
  matcher: "/:path*",
};
