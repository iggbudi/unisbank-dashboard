import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function hmacSha256(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyToken(token: string): Promise<boolean> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;

  const parts = token.split(":");
  if (parts.length !== 3) return false;

  const [username, expiresStr, signature] = parts;
  const payload = `${username}:${expiresStr}`;
  const expectedSig = await hmacSha256(payload, secret);

  if (signature !== expectedSig) return false;
  if (Date.now() > parseInt(expiresStr)) return false;

  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public admin paths
  if (pathname === "/admin/login") {
    const session = request.cookies.get("session")?.value;
    if (session && (await verifyToken(session))) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // Protected admin paths
  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get("session")?.value;
    if (!session || !(await verifyToken(session))) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Protect admin API with origin check
  if (pathname.startsWith("/api/admin")) {
    const session = request.cookies.get("session")?.value;
    if (!session || !(await verifyToken(session))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
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
