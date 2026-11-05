# Inbetween landing page

One page, one job: get GTA 6 streamers (and their editors) to apply for launch week.
Next.js App Router, TypeScript, Tailwind v4, Framer Motion, Supabase. Statically rendered, except the two form routes.

## Run it

```bash
npm install
cp .env.example .env.local   # optional locally: without it, forms succeed but save nothing
npm run dev
```

## Before launch

1. **Supabase:** run `supabase/migrations/0001_landing.sql`, then set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. In production, the forms return "offline" until these are set.
2. **Discord:** set `DISCORD_WEBHOOK_URL` (server-only). If a ping fails, the application is still saved.
3. **Confirm `src/lib/site.ts`:** domain, contact email, YouTube URL, reel views and brand names. Proof must be real and current at publish time.
4. **Sample strip:** swap the demo clips for Sameer Error reels in `samples` in `src/lib/site.ts` (set `demo: false`).

## Where things live

| What | Where |
|---|---|
| Copy config, proof, samples, testimonials | `src/lib/site.ts` |
| Pixel city and action (seeded, deterministic) | `src/world/engine.ts` |
| Scroll-scrubbed "How it works" | `src/components/SignalChain.tsx` |
| Form routes | `src/app/api/apply`, `src/app/api/waitlist` |
| Hero loop and sample clip sources | `video/` |

The page is a story: one idea per scroll, and UI only appears when the story needs it. Type is flat, with no glow or blur on text.

Every value in `SignalChain` is a function of scroll progress, so it plays correctly backwards. The narration and its timing live in `LINES`, the visuals in `frame()`. If a section feels too fast, make it taller rather than adding easing.

## Re-rendering video

The site and the videos share one engine. After changing `engine.ts`:

```bash
npm run video:bundle
python3 scripts/gen-clips.py
cd video/hero && HYPERFRAMES_SKIP_SKILLS=1 npx --yes hyperframes@0.8.202 render --quality high --workers 4 -o ../renders/hero.mp4
```

Then encode to `public/media` with ffmpeg (hero budget: MP4 ≤ 2.5MB, WebM ≤ 2MB). Scanlines and grain are deliberately not baked in: CSS adds them, which keeps files small and avoids moire.

## Known limits

- The rate limiter is per serverless instance, so it slows one abuser but isn't a global cap. The honeypot, minimum fill time and DB constraints back it up.
- The hero poster is the payoff frame at 9.3s rather than frame 0, so the product still makes sense if autoplay is refused (Low Power Mode, for example).
