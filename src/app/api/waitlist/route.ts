import { NextResponse } from "next/server";
import { clientIp, rateLimited } from "@/lib/rate-limit";
import { cleanUtm, supabase } from "@/lib/supabase";
import { isEmail } from "@/lib/validation";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }
  if (body.website) return NextResponse.json({ ok: true });

  if (rateLimited(`waitlist:${clientIp(req)}`)) {
    return NextResponse.json({ ok: false, error: "Too many tries. Give it a few minutes." }, { status: 429 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!isEmail(email)) return NextResponse.json({ ok: false, error: "That email looks off." }, { status: 422 });

  const db = supabase();
  if (!db) {
    if (process.env.NODE_ENV === "production") {
      console.error("waitlist: Supabase env is not configured");
      return NextResponse.json({ ok: false, error: "The form is offline. Try again soon." }, { status: 503 });
    }
    return NextResponse.json({ ok: true, dev: true });
  }

  const { error } = await db.from("waitlist").insert({ email, utm: cleanUtm(body.utm) });
  // 23505 is a repeat signup. They're already on the list, so that's a success.
  if (error && error.code !== "23505") {
    console.error("waitlist: insert failed", error.message);
    return NextResponse.json({ ok: false, error: "Something broke on our end. Try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
