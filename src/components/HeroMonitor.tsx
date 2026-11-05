"use client";

import { useEffect, useRef } from "react";
import { prefersReduced, useReduced } from "@/lib/useReduced";
import { track } from "@/lib/track";

const LOOP = 11;

export function HeroMonitor() {
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useReduced();

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    // Read the media query directly: this has to be right on the very first effect.
    if (reduced || prefersReduced()) {
      v.pause();
      return;
    }

    // Autoplay can be refused. The poster is the payoff frame, so it still explains the product.
    v.play().catch(() => {});

    let lastTime = 0;
    let completed = false;
    const onTime = () => {
      const t = v.currentTime % LOOP;
      // One full pass counts as watched.
      if (t < lastTime - 5 && !completed) {
        completed = true;
        track("hero_video_complete");
      }
      lastTime = t;
    };
    v.addEventListener("timeupdate", onTime);

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);

    return () => {
      v.removeEventListener("timeupdate", onTime);
      io.disconnect();
    };
  }, [reduced]);

  return (
    <div className="crt vhs-hover">
      <div className="crt-screen crt-on aspect-[4/3]">
        <video
          ref={video}
          className="vhs-layer"
          poster="/media/hero-poster.jpg"
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="How Inbetween works, in five beats. You're live. Chat loses it. We catch it, with a Moment Detected stamp. We cut it vertical, with captions. It's in your Discord in about 2 minutes."
        >
          <source src="/media/hero.webm" type="video/webm" />
          <source src="/media/hero.mp4" type="video/mp4" />
        </video>
        <div className="crt-glass" />
      </div>
    </div>
  );
}
