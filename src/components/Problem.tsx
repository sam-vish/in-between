"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useReduced } from "@/lib/useReduced";

const CARDS = [
  { text: "Your editor finds it tomorrow. The hype was yesterday.", r: -1.6, a: 0.56 },
  { text: "Clippers post your moment before you do.", r: 1.2, a: 0.71 },
  { text: "You can't clip and play at the same time.", r: -0.7, a: 0.86 },
];

// 30 seconds out of 28,800, drawn at true scale. That's the whole argument.
const SLIVER_POS = ((5 * 3600 + 47 * 60 + 12) / 28800) * 100;
const SLIVER_W = (30 / 28800) * 100;

function useLine(p: MotionValue<number>, a: number, b: number) {
  return useTransform(p, [a, a + 0.03, b - 0.03, b], [0, 1, 1, 0]);
}

function Card({ c, p }: { c: (typeof CARDS)[number]; p: MotionValue<number> }) {
  const opacity = useTransform(p, [c.a, c.a + 0.012], [0, 1]);
  const scale = useTransform(p, [c.a, c.a + 0.03], [1.08, 1]);
  return (
    <motion.li className="absolute inset-0 grid place-items-center" style={{ opacity, scale, rotate: c.r }}>
      <div className="tape w-[min(88vw,760px)] px-7 py-10 md:px-12 md:py-14">
        <p className="marker text-[clamp(1.9rem,4.6vw,3.4rem)]">{c.text}</p>
      </div>
    </motion.li>
  );
}

function Tape() {
  return (
    <>
      <div className="absolute inset-0 bg-[repeating-linear-gradient(to_right,rgb(239_230_210/0.14)_0_2px,transparent_2px_6px)]" />
      <div
        className="absolute inset-y-0 bg-signal"
        style={{ left: `${SLIVER_POS}%`, width: `max(${SLIVER_W}%, 2px)` }}
      />
    </>
  );
}

export function Problem() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReduced();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const l1 = useLine(p, 0, 0.17);
  const l2 = useLine(p, 0.18, 0.35);
  const l3 = useLine(p, 0.36, 0.53);
  // The first line is already there when the section arrives.
  const l1o = useTransform(l1, (v) => (p.get() < 0.08 ? 1 : v));

  const barO = useTransform(p, [0, 0.03, 0.5, 0.53], [1, 1, 1, 0]);
  const headX = useTransform(p, [0, 0.3], [0, SLIVER_POS]);
  const headLeft = useMotionTemplate`${headX}%`;
  const noteO = useTransform(p, [0.26, 0.3, 0.5, 0.53], [0, 1, 1, 0]);

  if (reduced) {
    return (
      <section id="problem" className="px-[var(--gutter)] py-28">
        <h2 className="display max-w-[15ch] text-[clamp(3rem,9vw,8rem)]">8 hours live. Your best 30 seconds die in the VOD.</h2>
        <div aria-hidden className="relative mt-14 h-[64px]">
          <Tape />
        </div>
        <ul className="mt-14 grid gap-6">
          {CARDS.map((c) => (
            <li key={c.text} className="tape max-w-[760px] px-7 py-8">
              <p className="marker text-[1.9rem]">{c.text}</p>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section id="problem" ref={ref} className="relative h-[520svh]">
      <h2 className="sr-only">8 hours live. Your best 30 seconds die in the VOD.</h2>
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* One line at a time, in the same spot. */}
        <div aria-hidden className="absolute inset-x-[var(--gutter)] top-[24%] md:top-[22%]">
          {[
            { t: "8 hours live.", o: l1o },
            { t: "Your best 30 seconds", o: l2 },
            { t: "die in the VOD.", o: l3 },
          ].map(({ t, o }) => (
            <motion.p key={t} className="display absolute inset-x-0 top-0 text-[clamp(3.4rem,11vw,11rem)]" style={{ opacity: o }}>
              {t}
            </motion.p>
          ))}
        </div>

        <motion.figure aria-hidden className="absolute inset-x-[var(--gutter)] top-[62%]" style={{ opacity: barO }}>
          <motion.p
            className="hud absolute bottom-[calc(100%+12px)] -translate-x-full whitespace-nowrap pr-1 text-[1.25rem] text-signal md:text-[1.5rem]"
            style={{ left: `${SLIVER_POS}%`, opacity: noteO }}
          >
            Drawn to scale.
          </motion.p>
          <div className="relative h-[56px] md:h-[76px]">
            <Tape />
            <motion.div className="absolute -inset-y-1.5 w-[2px] bg-cream" style={{ left: headLeft }} />
          </div>
          <div className="hud mt-2 flex justify-between text-[1.15rem] text-cream-dim">
            <span>00:00</span>
            <span>08:00</span>
          </div>
        </motion.figure>

        {/* Then the three reasons, each landing on top of the last. */}
        <ul className="absolute inset-0">
          {CARDS.map((c) => (
            <Card key={c.text} c={c} p={p} />
          ))}
        </ul>
      </div>
    </section>
  );
}
