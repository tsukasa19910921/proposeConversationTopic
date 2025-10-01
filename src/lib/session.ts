import { cookies } from "next/headers";
import crypto from "crypto";

const NAME = "sid";
const MAX_AGE = Number(process.env.SESSION_MAX_AGE_SECONDS || 86400);
const SECRET = process.env.SESSION_SECRET!;

export function issueTicket(userId: string) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `${userId}.${exp}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function setSessionCookie(resp: any, userId: string) {
  const ticket = issueTicket(userId);
  resp.cookies.set(NAME, ticket, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",  // Changed from "strict" to "lax" for mobile compatibility
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearSessionCookie(resp: any) {
  resp.cookies.set(NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",  // Changed from "strict" to "lax" for consistency
    path: "/",
    maxAge: 0,
  });
}

export function requireSession() {
  const raw = cookies().get(NAME)?.value;
  if (!raw) throw new Error("UNAUTH");

  const parts = raw.split(".");
  if (parts.length !== 3) throw new Error("INVALID_FORMAT");

  const [userId, expStr, sig] = parts;
  const exp = Number(expStr);
  const now = Math.floor(Date.now() / 1000);

  if (now > exp) throw new Error("EXPIRED");

  const payload = `${userId}.${exp}`;
  const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");

  if (expected !== sig) throw new Error("BADSIG");

  return { userId };
}