import { track as vercelTrack } from "@vercel/analytics";

export type EventName =
  | "cta_apply_click"
  | "form_start"
  | "form_submit"
  | "waitlist_submit"
  | "hero_video_complete"
  | "faq_open";

export function track(name: EventName, props?: Record<string, string | number | boolean>) {
  try {
    vercelTrack(name, props);
  } catch {
    // Analytics must never break the page.
  }
}
