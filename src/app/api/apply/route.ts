import { NextResponse } from "next/server";
import { clientIp, rateLimited } from "@/lib/rate-limit";
import { cleanUtm, supabase } from "@/lib/supabase";
import { normalizeTwitch, validateApply, type ApplyInput } from "@/lib/validation";

const MIN_FILL_MS = 2500;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }

  // Bots fill the honeypot and submit instantly. Tell them it worked and drop it.
  const elapsed = Number(body.elapsedMs ?? 0);
  if (body.website || elapsed < MIN_FILL_MS) return NextResponse.json({ ok: true });

  if (rateLimited(`apply:${clientIp(req)}`)) {
    return NextResponse.json({ ok: false, error: "Too many tries. Give it a few minutes." }, { status: 429 });
  }

  const str = (k: keyof ApplyInput) => (typeof body[k] === "string" ? (body[k] as string) : "");
  const input: ApplyInput = {
    twitch: str("twitch"),
    avgViewers: str("avgViewers"),
    language: str("language"),
    email: str("email"),
    discord: str("discord"),
    hasEditor: str("hasEditor"),
    notes: str("notes"),
  };

  const errors = validateApply(input);
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 422 });

  const row = {
    twitch_login: normalizeTwitch(input.twitch).toLowerCase(),
    avg_viewers: input.avgViewers,
    language: input.language,
    email: input.email.trim() || null,
    discord: input.discord.trim().replace(/^@/, "") || null,
    has_editor: input.hasEditor === "yes",
    notes: input.notes.trim() || null,
    utm: cleanUtm(body.utm),
  };

  const db = supabase();
  if (!db) {
    if (process.env.NODE_ENV === "production") {
      console.error("apply: Supabase env is not configured");
      return NextResponse.json({ ok: false, error: "The form is offline. Try again soon." }, { status: 503 });
    }
    console.info("apply (dev, not saved):", row.twitch_login);
    return NextResponse.json({ ok: true, dev: true });
  }

  const { error } = await db.from("applications").insert(row);
  if (error) {
    console.error("apply: insert failed", error.message);
    return NextResponse.json({ ok: false, error: "Something broke on our end. Try again." }, { status: 500 });
  }

  await pingDiscord(row);
  return NextResponse.json({ ok: true });
}

async function pingDiscord(row: {
  twitch_login: string;
  avg_viewers: string;
  language: string;
  email: string | null;
  discord: string | null;
  has_editor: boolean;
  notes: string | null;
  utm: Record<string, string>;
}) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;
  const utm = Object.entries(row.utm).map(([k, v]) => `${k}=${v}`).join(" ");
  const lines = [
    `**New launch week application**`,
    `Twitch: https://twitch.tv/${row.twitch_login}`,
    `Viewers: ${row.avg_viewers} · Language: ${row.language} · Editor: ${row.has_editor ? "yes" : "no"}`,
    `Contact: ${[row.email, row.discord].filter(Boolean).join(" / ")}`,
    row.notes ? `Notes: ${row.notes}` : null,
    utm ? `UTM: ${utm}` : null,
  ].filter(Boolean);
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // allowed_mentions stops a pasted @everyone from pinging the whole server.
      body: JSON.stringify({ content: lines.join("\n").slice(0, 1900), allowed_mentions: { parse: [] } }),
      signal: AbortSignal.timeout(3000),
    });
  } catch (err) {
    // The row is saved. A failed ping shouldn't fail the applicant.
    console.error("apply: discord ping failed", err);
  }
}
