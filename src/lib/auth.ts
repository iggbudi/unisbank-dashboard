// ============================================
// Auth Helpers: password verification & session
// ============================================

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function hmac(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) throw new Error("ADMIN_PASSWORD_HASH not set");
  return bcrypt.compare(password, hash);
}

export function createSessionToken(username: string): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET not set");
  const expires = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `${username}:${expires}`;
  const signature = hmac(payload, secret);
  return `${payload}:${signature}`;
}

export function verifySessionToken(
  token: string
): { valid: boolean; username?: string } {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return { valid: false };

  const parts = token.split(":");
  if (parts.length !== 3) return { valid: false };

  const [username, expiresStr, signature] = parts;
  const payload = `${username}:${expiresStr}`;
  const expectedSig = hmac(payload, secret);

  if (signature !== expectedSig) return { valid: false };
  if (Date.now() > parseInt(expiresStr)) return { valid: false };

  return { valid: true, username };
}

export async function setSessionCookie(username: string) {
  const token = createSessionToken(username);
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function getSessionUser(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session?.value) return null;

  const result = verifySessionToken(session.value);
  return result.valid ? result.username! : null;
}
