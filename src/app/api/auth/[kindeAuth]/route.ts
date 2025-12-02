import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

type RouteContext = {
  params: {
    kindeAuth: string;
  };
};

const authHandler = handleAuth();

const allowedOrigins = [
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : undefined,
  "https://casepanda.vercel.app",
  "http://localhost:3000",
].filter(Boolean) as string[];

const corsHeaders = (request: Request) => {
  const requestOrigin = new URL(request.url).origin;
  const originHeader = request.headers.get("origin");
  const requestedHeaders = request.headers.get("access-control-request-headers");
  const normalizedOrigin = originHeader && (originHeader === requestOrigin || allowedOrigins.includes(originHeader))
    ? originHeader
    : allowedOrigins[0] ?? requestOrigin;

  return {
    "Access-Control-Allow-Origin": normalizedOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": requestedHeaders ?? "Content-Type,Authorization,X-Requested-With",
    "Access-Control-Max-Age": "86400",
  };
};

export const GET = async (request: Request, context: RouteContext) => {
  const response = await authHandler(request, context);
  const headers = new Headers(response.headers);

  Object.entries(corsHeaders(request)).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export const OPTIONS = (request: Request) => {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders(request),
      "Content-Length": "0",
    },
  });
};
