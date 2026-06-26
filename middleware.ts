import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function verifyToken(token: string): boolean {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;

  const crypto = require("crypto");
  const parts = token.split(":");
  if (parts.length !== 3) return false;

  const [username, expiresStr, signature] = parts;
  const payload = `${username}:${expiresStr}`;
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  if (signature !== expectedSig) return false;
  if (Date.now() > parseInt(expiresStr)) return false;

  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public admin paths
  if (pathname === "/admin/login") {
    // If already logged in, redirect to admin dashboard
    const session = request.cookies.get("session")?.value;
    if (session && verifyToken(session)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // Protected admin paths
  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get("session")?.value;
    if (!session || !verifyToken(session)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Protect admin API with origin check
  if (pathname.startsWith("/api/admin")) {
    const session = request.cookies.get("session")?.value;
    if (!session || !verifyToken(session)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    // CSRF: origin check
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    if (origin && host && !origin.includes(host)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
