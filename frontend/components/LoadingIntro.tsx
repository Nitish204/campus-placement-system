"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Deliberately a different mechanic from the rotating-logo intro used
// elsewhere: three dots in the accent trio (violet/coral/amber) bounce
// in a staggered wave - like a "thinking" indicator, not a spinner - then
// scale up and fade together as the overlay lifts. No rotation anywhere
// in this component.
const dotColors = ["bg-violet", "bg-coral", "bg-amber"];

export function LoadingIntro() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-50 bg-base flex items-center justify-center"
        >
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-3">
              {dotColors.map((color, i) => (
                <motion.span
                  key={i}
                  className={`w-4 h-4 rounded-full ${color}`}
                  animate={{ y: [0, -18, 0], scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                />
              ))}
            </div>
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="font-display font-semibold text-ink/70 text-sm tracking-wide"
            >
              Campus Place
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
