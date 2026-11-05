"use client";

import { useReduced } from "@/lib/useReduced";
import { useEffect, useRef } from "react";
import { useMotionValueEvent, useScroll, useTransform } from "framer-motion";

export function ProofCounter({ to }: { to: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const out = useRef<HTMLSpanElement>(null);
  const reduced = useReduced();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "start 0.42"] });
  const value = useTransform(scrollYProgress, [0, 1], [0, to]);

  const write = (v: number) => {
    if (out.current) out.current.textContent = Math.round(v).toLocaleString("en-US");
  };
  useMotionValueEvent(value, "change", (v) => {
    if (!reduced) write(v);
  });
  useEffect(() => {
    write(reduced ? to : value.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return (
    <p ref={ref} className="hud text-[clamp(4rem,17.6vw,18rem)] leading-[0.82] tracking-[-0.02em] text-cream">
      <span className="sr-only">Over one million views on a single reel.</span>
      <span aria-hidden>
        <span ref={out} className="tabular-nums">
          {to.toLocaleString("en-US")}
        </span>
        <span className="text-signal">+</span>
      </span>
    </p>
  );
}
