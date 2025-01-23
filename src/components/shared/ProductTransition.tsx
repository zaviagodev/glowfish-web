import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ProductTransitionProps {
  children: React.ReactNode;
  isPresent: boolean;
  onExitComplete?: () => void;
}

export function ProductTransition({ children, isPresent, onExitComplete }: ProductTransitionProps) {
  const [portalNode] = useState(() => document.createElement("div"));

  useEffect(() => {
    document.body.appendChild(portalNode);
    document.body.style.overflow = isPresent ? 'hidden' : '';
    return () => {
      document.body.removeChild(portalNode);
      document.body.style.overflow = '';
    };
  }, [portalNode, isPresent]);

  return createPortal(
    <AnimatePresence mode="wait" onExitComplete={onExitComplete}>
      {isPresent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[8px]"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    portalNode
  );
}