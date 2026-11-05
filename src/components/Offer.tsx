"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReduced } from "@/lib/useReduced";
import { ApplyCta } from "./ApplyCta";

export function Offer() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReduced();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // The sign strikes with a stutter, the room goes red, then the offer, one line per scroll.
  const lit = useTransform(p, [0.08, 0.1, 0.12, 0.14, 0.16, 0.18], [0, 1, 0.1, 1, 0.3, 1]);
  const room = useTransform(p, [0.16, 0.3], [0, 1]);
  const headO = useTransform(p, [0.32, 0.38], [0, 1]);
  const subO = useTransform(p, [0.52, 0.58], [0, 1]);
  const ctaO = useTransform(p, [0.72, 0.78], [0, 1]);

  const sign = (
    <span className="relative inline-block rounded-[4px] border-[3px] border-signal px-[0.34em] pb-[0.02em] pt-[0.1em] text-[clamp(2.6rem,7vw,5.4rem)]">
      <span className="display text-signal">On air</span>
    </span>
  );

  if (reduced) {
    return (
      <section id="offer" className="bg-[#3d0b07] px-[var(--gutter)] py-28 text-center">
        <span className="display inline-block rounded-[4px] bg-signal px-[0.34em] pb-[0.02em] pt-[0.1em] text-[clamp(2.6rem,7vw,5.4rem)] text-phosphor">
          On air
        </span>
        <h2 className="display mx-auto mt-12 max-w-[16ch] text-[clamp(3rem,8vw,7.4rem)]">Launch week is free. 5 streamers only.</h2>
        <p className="mx-auto mt-6 max-w-[44ch] text-[1.2rem]">
          We run Inbetween on your GTA 6 streams for 7 days. You keep every clip. If it&apos;s not worth it, walk away.
        </p>
        <div className="mt-10">
          <ApplyCta location="offer" />
        </div>
      </section>
    );
  }

  return (
    <section id="offer" ref={ref} className="relative h-[320svh]">
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden px-[var(--gutter)] text-center">
        <motion.div aria-hidden className="absolute inset-0 bg-[#3d0b07]" style={{ opacity: room }} />
        <div className="relative">
          <div className="relative inline-block">
            {sign}
            {/* Lit state: the panel fills with light and the letters go dark. */}
            <motion.span
              aria-hidden
              className="display absolute inset-0 grid place-items-center rounded-[4px] bg-signal pt-[0.1em] text-[clamp(2.6rem,7vw,5.4rem)] text-phosphor"
              style={{ opacity: lit }}
            >
              On air
            </motion.span>
          </div>
          <motion.h2 className="display mx-auto mt-10 max-w-[16ch] text-[clamp(3rem,8vw,7.4rem)]" style={{ opacity: headO }}>
            Launch week is free. 5 streamers only.
          </motion.h2>
          <motion.p className="mx-auto mt-6 max-w-[44ch] text-[1.1rem] md:text-[1.3rem]" style={{ opacity: subO }}>
            We run Inbetween on your GTA 6 streams for 7 days. You keep every clip. If it&apos;s not worth it, walk away.
          </motion.p>
          <motion.div className="mt-9" style={{ opacity: ctaO }}>
            <ApplyCta location="offer" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
