"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
              className="w-14 h-14 rounded-2xl bg-accent-gradient shadow-glow-violet flex items-center justify-center font-display font-bold text-white text-xl"
            >
              C
            </motion.div>
            <span className="font-display font-bold text-lg text-ink">Campus Place</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
