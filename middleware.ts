import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  // Define route patterns
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");
  const isAuthCallback = request.nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = request.nextUrl.pathname === "/" || 
                        request.nextUrl.pathname === "/favicon.ico" ||
                        request.nextUrl.pathname.startsWith("/_next") ||
                        request.nextUrl.pathname.startsWith("/images") ||
                        request.nextUrl.pathname.startsWith("/styles");

  // Always allow auth-related routes to pass through
  if (isAuthCallback || isAuthPage) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect API routes (except auth routes)
  if (isApiRoute && !token && !isAuthCallback) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // Protect dashboard and results pages
  if ((request.nextUrl.pathname.startsWith("/dashboard") || 
       request.nextUrl.pathname.startsWith("/results")) && 
      !token && !isPublicRoute) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/results/:path*",
    "/api/:path*",
    "/auth/:path*",
  ],
}; 