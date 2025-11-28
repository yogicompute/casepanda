import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// CORS middleware for API routes. It only allows requests from a small set of
// trusted origins (production and localhost). It answers OPTIONS preflight
// requests early and attaches CORS headers to other API responses.

const ALLOWED_ORIGINS = [
  "https://casepanda.vercel.app",
  "http://localhost:3000",
];

const ALLOWED_METHODS = "GET,HEAD,POST,PUT,DELETE,OPTIONS";

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);

  // Respond to preflight requests directly with the appropriate headers.
  if (request.method === "OPTIONS") {
    const res = new NextResponse(null, { status: 204 });
    if (isAllowed) {
      res.headers.set("Access-Control-Allow-Origin", origin as string);
      res.headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS);
      res.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With"
      );
      // Allow credentials if your client uses cookies (set specific origin above)
      res.headers.set("Access-Control-Allow-Credentials", "true");
      res.headers.set("Access-Control-Max-Age", "86400");
    }
    return res;
  }

  // For other API requests, continue and attach CORS headers when allowed.
  const res = NextResponse.next();
  if (isAllowed) {
    res.headers.set("Access-Control-Allow-Origin", origin as string);
    res.headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS);
    res.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With"
    );
    res.headers.set("Access-Control-Allow-Credentials", "true");
  }
  return res;
}

export const config = {
  matcher: ["/api/:path*"],
};
