import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // This function runs after authentication
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Returns true if a user is logged in
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Protect these routes: dashboard and any sub-routes
export const config = { 
  matcher: ["/dashboard/:path*"] 
};