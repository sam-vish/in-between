"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useReduced } from "@/lib/useReduced";

/** A plain fade as something scrolls into view. Nothing bounces, nothing rotates. */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReduced();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-18% 0px" }}
      transition={reduced ? { duration: 0 } : { duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
