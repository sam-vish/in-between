"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { track } from "@/lib/track";
import { captureUtm } from "@/lib/utm";
import { isEmail } from "@/lib/validation";

export function Waitlist() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const utm = useRef<Record<string, string>>({});
  const hp = useRef<HTMLInputElement>(null);

  useEffect(() => {
    utm.current = captureUtm();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!isEmail(email.trim())) {
      setError("That email looks off.");
      return;
    }
    setError("");
    setStatus("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, utm: utm.current, website: hp.current?.value ?? "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error ?? "That didn't go through. Try again.");
        setStatus("idle");
        return;
      }
      track("waitlist_submit");
      setStatus("done");
    } catch {
      setError("Couldn't reach us. Try again.");
      setStatus("idle");
    }
  }

  return (
    <section aria-labelledby="waitlist-title" className="border-t border-cream/15 px-[var(--gutter)] py-14 md:py-20">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <h2 id="waitlist-title" className="max-w-[26ch] text-[1.3rem] leading-snug md:text-[1.55rem]">
          Small streamer or clipper? The self-serve version of Inbetween is coming.
        </h2>
        {status === "done" ? (
          <p role="status" className="text-[1.2rem] text-go">
            ✓ You&apos;re on the list.
          </p>
        ) : (
          <form onSubmit={submit} noValidate className="w-full md:w-auto">
            <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
              <label>
                Website
                <input ref={hp} type="text" name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="wl-email" className="sr-only">
                Email
              </label>
              <input
                id="wl-email"
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                aria-invalid={!!error}
                aria-describedby={error ? "wl-err" : undefined}
                className="min-h-[52px] w-full rounded-[3px] bg-white/8 px-3 text-[1.05rem] text-cream placeholder:text-cream-dim sm:w-[320px]"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="min-h-[52px] flex-none cursor-pointer rounded-[5px] bg-cream px-5 font-display text-[1.12rem] uppercase tracking-[0.03em] text-ink transition-colors hover:bg-white disabled:opacity-70"
              >
                {status === "sending" ? "Sending…" : "Join waitlist"}
              </button>
            </div>
            {error && (
              <p id="wl-err" role="alert" className="mt-2 text-[0.95rem] text-[#ff8a80]">
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
