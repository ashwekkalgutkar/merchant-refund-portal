"use client";

import { useAppStore } from '@/store/app';
import { motion, AnimatePresence } from 'framer-motion';

export default function NetworkLoader() {
  const isLoading = useAppStore((state) => state.isLoading);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 3 }}
          exit={{ opacity: 0, height: 3 }}
          className="fixed top-0 inset-x-0 z-[100] bg-brand-500 overflow-hidden"
        >
          <div className="w-full h-full bg-white/30 animate-[pulse_1s_ease-in-out_infinite] shadow-[0_0_15px_rgba(14,165,233,0.8)]" />
          <div className="absolute top-0 left-0 h-full bg-white/50 w-1/3 animate-[translateX_1.5s_infinite_linear]" style={{
             animation: 'slideRight 1.5s infinite ease-in-out'
          }} />
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes slideRight {
              0% { transform: translateX(-100%); width: 10%; }
              50% { width: 30%; }
              100% { transform: translateX(400%); width: 10%; }
            }
          `}} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
