"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReduced } from "@/lib/useReduced";
import { track } from "@/lib/track";

const ITEMS = [
  ["Do you post on my account?", "No. Clips land in your Discord, and you post them. Auto-posting comes later, and only if you want it."],
  ["Who owns the clips?", "You do."],
  ["What do you need from me?", "Your OK, your Twitch channel, and a Discord channel for us to drop clips in."],
  ["Which platforms?", "Twitch now. Kick and YouTube Live are coming."],
  ["Only GTA 6?", "GTA 6 first. It works on any game."],
  ["What languages?", "Captions in English, Portuguese and Spanish."],
  ["Is it all AI?", "AI finds and edits. A human on our team checks every clip before you see it."],
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  const reduced = useReduced();

  return (
    <section id="faq" aria-labelledby="faq-title" className="px-[var(--gutter)] py-28 md:py-44">
      <div className="mx-auto max-w-[860px]">
        <h2 id="faq-title" className="display mb-10 text-[clamp(3rem,7vw,6rem)]">
          FAQ
        </h2>
        <ul>
          {ITEMS.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <li key={q} className="border-t border-cream/15">
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => {
                      if (!isOpen) track("faq_open", { question: q });
                      setOpen(isOpen ? null : i);
                    }}
                    className="tt-q"
                  >
                    <span>{q}</span>
                    <span aria-hidden className="tt-p">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-a-${i}`}
                      role="region"
                      aria-labelledby={`faq-q-${i}`}
                      initial={reduced ? false : { height: 0 }}
                      animate={{ height: "auto" }}
                      exit={reduced ? undefined : { height: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[56ch] pb-6 text-[1.1rem] text-cream/85 md:text-[1.2rem]">{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
