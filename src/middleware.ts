import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Global middleware to add CORS headers for API routes and handle preflight.
// This runs at the Edge and ensures OPTIONS requests are answered with the
// proper Access-Control-Allow-* headers so browsers allow the subsequent
// request.

const ALLOWED_METHODS = "GET,HEAD,POST,PUT,DELETE,OPTIONS";

export function middleware(request: NextRequest) {
  // Use the request origin if present so we can support credentialed requests.
  const origin = request.headers.get("origin") || "*";

  // Respond to preflight requests early with the required headers
  if (request.method === "OPTIONS") {
    const res = new NextResponse(null, { status: 204 });
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS);
    res.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With"
    );
    res.headers.set("Access-Control-Max-Age", "86400");
    // If you use cookies or other credentials, keep this true and ensure you
    // set a specific origin instead of '*'.
    res.headers.set("Access-Control-Allow-Credentials", "true");
    return res;
  }

  // For other requests, continue but attach CORS headers to the response.
  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS);
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");
  return response;
}

// Only run this middleware for API routes
export const config = {
  matcher: ["/api/:path*"],
};
