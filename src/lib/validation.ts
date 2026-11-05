export const AVG_VIEWERS = ["<200", "200-500", "500-2k", "2k+"] as const;
export const LANGUAGES = ["EN", "PT-BR", "ES", "Other"] as const;

export type ApplyInput = {
  twitch: string;
  avgViewers: string;
  language: string;
  email: string;
  discord: string;
  hasEditor: string;
  notes: string;
};

export type FieldErrors = Partial<Record<keyof ApplyInput | "contact", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Accepts a bare login, @login or a pasted twitch.tv link. */
export function normalizeTwitch(raw: string) {
  return raw
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^(www\.)?twitch\.tv\//i, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "");
}

export function isEmail(v: string) {
  return v.length <= 254 && EMAIL.test(v);
}

export function validateApply(v: ApplyInput): FieldErrors {
  const e: FieldErrors = {};
  const login = normalizeTwitch(v.twitch);
  if (!login) e.twitch = "We need your Twitch username.";
  else if (!/^[a-zA-Z0-9_]{3,25}$/.test(login)) e.twitch = "That doesn't look like a Twitch username.";
  if (!(AVG_VIEWERS as readonly string[]).includes(v.avgViewers)) e.avgViewers = "Pick the closest range.";
  if (!(LANGUAGES as readonly string[]).includes(v.language)) e.language = "Pick a language.";
  const email = v.email.trim();
  const discord = v.discord.trim();
  if (!email && !discord) e.contact = "Give us an email or a Discord handle, so we can reach you.";
  if (email && !isEmail(email)) e.email = "That email looks off.";
  if (discord && !/^[\w.#-]{2,37}$/.test(discord.replace(/^@/, ""))) e.discord = "That handle looks off.";
  if (v.hasEditor !== "yes" && v.hasEditor !== "no") e.hasEditor = "Yes or no.";
  if (v.notes.length > 1000) e.notes = "Keep it under 1000 characters.";
  return e;
}
