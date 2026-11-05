/**
 * Everything that changes without a code change lives here.
 * Items marked CONFIRM need a real answer from Sameer before launch.
 */
export const site = {
  name: "Inbetween",
  title: "Inbetween · AI live clipping for GTA 6 streamers",
  description:
    "Inbetween watches your GTA 6 stream live, catches the moments chat loses it, and has vertical shorts ready in about two minutes. Launch week is free for 5 streamers.",
  // CONFIRM: final domain (PRD open question).
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://inbetween.gg",
  // CONFIRM: real contact address and channel URL.
  contactEmail: "hello@inbetween.gg",
  youtubeUrl: "https://www.youtube.com/@SameerError",
};

/**
 * Proof numbers. PRD rule: real and current at publish time only.
 * CONFIRM both before launch; add more brands here as they are cleared.
 */
export const proof = {
  reelViews: 1_000_000,
  brands: ["Hostinger", "Higgsfield"],
};

/**
 * Sample strip. These are original code-drawn demos, so they say so on the page.
 * Swap in Sameer Error reels (and later real client clips) by changing `src`,
 * `poster` and setting `demo: false`.
 */
export const samples = [
  {
    id: "flip",
    src: "/media/sample-flip",
    poster: "/media/sample-flip.jpg",
    lang: "EN",
    title: "HE DID NOT SEE THAT COMING",
    alt: "Demo clip: a pixel-art car flips off a ramp while the streamer reacts. Captions read: bro what was that.",
    demo: true,
  },
  {
    id: "cops",
    src: "/media/sample-cops",
    poster: "/media/sample-cops.jpg",
    lang: "PT-BR",
    title: "CINCO VIATURAS ATRÁS DELE",
    alt: "Demo clip: a pixel-art car leads five police cars down a neon avenue. Portuguese captions read: mano, olha isso.",
    demo: true,
  },
  {
    id: "dawn",
    src: "/media/sample-dawn",
    poster: "/media/sample-dawn.jpg",
    lang: "ES",
    title: "NADIE LO VIO VENIR",
    alt: "Demo clip: a pixel-art car launches off a ramp at dawn. Spanish captions read: no puede ser.",
    demo: true,
  },
];

/** Filled in after launch week, with permission. The section stays honest until then. */
export const testimonials: Array<{ quote: string; who: string; stat?: string }> = [];
