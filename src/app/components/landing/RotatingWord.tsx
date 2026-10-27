"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface RotatingWordProps {
  words: string[];
  interval?: number;
  className?: string;
}

/**
 * Mot qui change à intervalle régulier avec une transition verticale.
 * La largeur du conteneur s'anime pour suivre le mot courant (pas d'espace mort).
 */
export function RotatingWord({
  words,
  interval = 2200,
  className,
}: RotatingWordProps) {
  const [index, setIndex] = useState(0);
  const [widths, setWidths] = useState<number[]>([]);
  const measureRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reduce = useReducedMotion();

  // Mesure la largeur de chaque mot (re-mesure au redimensionnement).
  useLayoutEffect(() => {
    const measure = () =>
      setWidths(measureRefs.current.map((el) => el?.offsetWidth ?? 0));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [words]);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % words.length),
      interval
    );
    return () => window.clearInterval(id);
  }, [interval, reduce, words.length]);

  const width = widths[index];

  return (
    <>
      {/* Mots invisibles servant uniquement à la mesure */}
      <span aria-hidden className="absolute -z-10 opacity-0 pointer-events-none whitespace-nowrap">
        {words.map((w, i) => (
          <span
            key={w}
            ref={(el) => {
              measureRefs.current[i] = el;
            }}
            className="inline-block"
          >
            {w}
          </span>
        ))}
      </span>
      <motion.span
        className={`relative inline-block overflow-hidden align-bottom whitespace-nowrap ${className ?? ""}`}
        aria-live="polite"
        animate={width ? { width } : undefined}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={words[index]}
            className="inline-block text-primary"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </>
  );
}
