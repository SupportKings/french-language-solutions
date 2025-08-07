"use client";

import { AnimatePresence, motion } from "motion/react";

interface FadeTransitionProps {
  children: React.ReactNode;
  /** Unique key to trigger transition when content changes */
  transitionKey: string | number;
  /** Duration of the animation in seconds */
  duration?: number;
  /** Additional CSS classes */
  className?: string;
}

export function FadeTransition({
  children,
  transitionKey,
  duration = 0.15,
  className,
}: FadeTransitionProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={transitionKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration,
          ease: "easeInOut",
        }}
        className={className}
      >
        {children as any}
      </motion.div>
    </AnimatePresence>
  );
}
