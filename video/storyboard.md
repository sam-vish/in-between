# storyboard.md: Inbetween hero loop

## Style
- 1280x960, 30fps, 11s, must loop (last frame = first frame)
- Bg #0B0B0C, cream #EFE6D2, signal red #FF3B2F, magenta #FF4FA3, cyan #3FD6E8
- Labels in VT323, big type in Anton
- Gameplay = original top-down pixel art: a car on a city grid at night. No real game assets.
- Easing: power2.out for entrances, power2.inOut for moves. No bounces.
- Deterministic: seeded RNG only (no Math.random)
- Scanlines, grain and vignette are NOT baked into the video. The site's CRT glass adds them at
  display resolution, which keeps the file inside budget and avoids moire when the video is scaled.

Each beat carries one plain caption, so the loop explains the product on its own:
0-2.5 You're live. / 2.5-4.5 Chat loses it. / 4.5-6 We catch it. / 6-8.5 We cut it vertical. / 8.5-10.2 In your Discord in about 2 min. / 10.2-11 You're live.
No glow or blur on any text. Chat only appears in beat 2, the stamp only in beat 3.
The action clock runs 0.6s ahead of the storyboard clock, so the flip peaks right as the freeze lands.
