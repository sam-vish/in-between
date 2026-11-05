"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { track } from "@/lib/track";
import { captureUtm } from "@/lib/utm";
import { AVG_VIEWERS, LANGUAGES, validateApply, type ApplyInput, type FieldErrors } from "@/lib/validation";

const EMPTY: ApplyInput = { twitch: "", avgViewers: "", language: "", email: "", discord: "", hasEditor: "", notes: "" };
const VIEWER_LABEL: Record<string, string> = { "<200": "<200", "200-500": "200–500", "500-2k": "500–2k", "2k+": "2k+" };

function Chips({
  name,
  legend,
  options,
  value,
  error,
  onChange,
  cols,
}: {
  name: keyof ApplyInput;
  legend: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  cols: string;
}) {
  return (
    <fieldset aria-describedby={error ? `${name}-err` : undefined}>
      <legend className="sheet-label">{legend}</legend>
      <div className={`grid gap-2 ${cols}`}>
        {options.map((o) => (
          <label key={o.value} className="chip">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              required
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p id={`${name}-err`} className="sheet-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export function ApplyForm() {
  const [v, setV] = useState<ApplyInput>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [formError, setFormError] = useState("");
  const startedAt = useRef(0);
  const utm = useRef<Record<string, string>>({});
  const honeypot = useRef<HTMLInputElement>(null);
  const success = useRef<HTMLDivElement>(null);

  useEffect(() => {
    utm.current = captureUtm();
    startedAt.current = Date.now();
  }, []);

  const started = useRef(false);
  const onFirstTouch = () => {
    if (!started.current) {
      started.current = true;
      track("form_start");
    }
  };

  const set = (k: keyof ApplyInput) => (value: string) => {
    setV((prev) => ({ ...prev, [k]: value }));
    setErrors((prev) => {
      if (!prev[k] && !(prev.contact && (k === "email" || k === "discord"))) return prev;
      const next = { ...prev };
      delete next[k];
      if (k === "email" || k === "discord") delete next.contact;
      return next;
    });
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    const found = validateApply(v);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0];
      const target = first === "contact" ? "email" : first;
      document.querySelector<HTMLElement>(`#apply [name="${target}"]`)?.focus();
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...v,
          utm: utm.current,
          website: honeypot.current?.value ?? "",
          elapsedMs: Date.now() - startedAt.current,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        if (data.errors) setErrors(data.errors);
        setFormError(data.error ?? "That didn't go through. Try again.");
        setStatus("idle");
        return;
      }
      track("form_submit", { language: v.language, viewers: v.avgViewers, ...(utm.current.utm_source ? { source: utm.current.utm_source } : {}) });
      setStatus("done");
      requestAnimationFrame(() => success.current?.focus());
    } catch {
      setFormError("Couldn't reach us. Check your connection and try again.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div ref={success} tabIndex={-1} role="status" className="sheet relative overflow-hidden p-8 md:p-12">
        <p className="display text-[2.2rem] md:text-[3rem]">
          Got it. We&apos;ll check out your stream and hit you up within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} onFocusCapture={onFirstTouch} noValidate className="sheet p-5 sm:p-7 md:p-9">
      {/* Honeypot: people never see it, bots can't resist it. */}
      <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-6">
        <div>
          <label htmlFor="twitch" className="sheet-label">
            Twitch username <span className="text-signal-deep">*</span>
          </label>
          <input
            id="twitch"
            name="twitch"
            className="sheet-input"
            value={v.twitch}
            onChange={(e) => set("twitch")(e.target.value)}
            onBlur={() => v.twitch && setErrors((p) => ({ ...p, twitch: validateApply(v).twitch }))}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="yourchannel"
            required
            aria-required
            aria-invalid={!!errors.twitch}
            aria-describedby={errors.twitch ? "twitch-err" : undefined}
          />
          {errors.twitch && (
            <p id="twitch-err" className="sheet-error">
              {errors.twitch}
            </p>
          )}
        </div>

        <Chips
          name="avgViewers"
          legend="Average viewers"
          cols="grid-cols-2 sm:grid-cols-4"
          options={AVG_VIEWERS.map((o) => ({ value: o, label: VIEWER_LABEL[o] }))}
          value={v.avgViewers}
          error={errors.avgViewers}
          onChange={set("avgViewers")}
        />

        <Chips
          name="language"
          legend="Stream language"
          cols="grid-cols-2 sm:grid-cols-4"
          options={LANGUAGES.map((o) => ({ value: o, label: o }))}
          value={v.language}
          error={errors.language}
          onChange={set("language")}
        />

        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="sheet-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                className="sheet-input"
                value={v.email}
                onChange={(e) => set("email")(e.target.value)}
                aria-invalid={!!errors.email || !!errors.contact}
                aria-describedby={errors.contact ? "contact-err" : errors.email ? "email-err" : "contact-hint"}
              />
              {errors.email && (
                <p id="email-err" className="sheet-error">
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="discord" className="sheet-label">
                Discord handle
              </label>
              <input
                id="discord"
                name="discord"
                className="sheet-input"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                value={v.discord}
                onChange={(e) => set("discord")(e.target.value)}
                aria-invalid={!!errors.discord || !!errors.contact}
                aria-describedby={errors.contact ? "contact-err" : errors.discord ? "discord-err" : "contact-hint"}
              />
              {errors.discord && (
                <p id="discord-err" className="sheet-error">
                  {errors.discord}
                </p>
              )}
            </div>
          </div>
          {errors.contact ? (
            <p id="contact-err" className="sheet-error">
              {errors.contact}
            </p>
          ) : (
            <p id="contact-hint" className="mt-1.5 text-[0.92rem] text-[#4a4438]">
              One of these is enough.
            </p>
          )}
        </div>

        <Chips
          name="hasEditor"
          legend="Do you have an editor?"
          cols="grid-cols-2"
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
          value={v.hasEditor}
          error={errors.hasEditor}
          onChange={set("hasEditor")}
        />

        <div>
          <label htmlFor="notes" className="sheet-label">
            Anything else? <span className="normal-case">(optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            maxLength={1000}
            className="sheet-input resize-y"
            value={v.notes}
            onChange={(e) => set("notes")(e.target.value)}
          />
        </div>

        {formError && (
          <p role="alert" className="sheet-error text-[1rem]">
            {formError}
          </p>
        )}

        <button type="submit" className="key w-full" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Apply for launch week →"}
        </button>
        <p className="-mt-2 text-center text-[0.92rem] text-[#4a4438]">Free for your first week. 5 spots.</p>
      </div>
    </form>
  );
}
