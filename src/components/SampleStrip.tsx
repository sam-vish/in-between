"use client";

import { useReduced } from "@/lib/useReduced";
import { useEffect, useRef } from "react";
import { samples } from "@/lib/site";

function Clip({ s }: { s: (typeof samples)[number] }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReduced();

  useEffect(() => {
    const v = ref.current;
    if (!v || reduced) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          v.preload = "auto";
          v.play().catch(() => {});
        } else v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <figure className="w-[62vw] max-w-[300px] flex-none snap-center md:w-auto md:max-w-none">
      <div className="crt vhs-hover !rounded-[24px] !p-[6px]">
        <div className="crt-screen vhs-layer aspect-[9/16] !rounded-[20px]">
          <video ref={ref} poster={s.poster} muted loop playsInline preload="none" aria-label={s.alt}>
            <source src={`${s.src}.webm`} type="video/webm" />
            <source src={`${s.src}.mp4`} type="video/mp4" />
          </video>
          <div className="crt-glass" />
        </div>
      </div>
      <figcaption className="mt-3 text-[0.98rem] text-cream-dim">
        {s.demo ? "Demo" : "Real clip"}, captions in {s.lang}
      </figcaption>
    </figure>
  );
}

export function SampleStrip() {
  return (
    <div className="-mx-[var(--gutter)] flex snap-x snap-mandatory gap-5 overflow-x-auto px-[var(--gutter)] pb-3 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
      {samples.map((s) => (
        <Clip key={s.id} s={s} />
      ))}
    </div>
  );
}
