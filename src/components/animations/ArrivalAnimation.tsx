import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslate } from "@refinedev/core";

interface ArrivalAnimationProps {
  onComplete: () => void;
}

export function ArrivalAnimation({ onComplete }: ArrivalAnimationProps) {
  const t = useTranslate();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        if (step < 3) {
          setStep(step + 1);
        } else {
          onComplete();
        }
      },
      step === 0 ? 500 : 1500
    );

    return () => clearTimeout(timer);
  }, [step, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      animate={{ opacity: step === 3 ? 0 : 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Step 1: Logo bounce in */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{
            scale: step === 0 ? 1 : 0,
            rotate: 0,
            y: step === 0 ? [null, -20, 0] : 0,
          }}
          transition={{
            type: "spring",
            damping: 10,
            stiffness: 100,
            duration: 0.5,
          }}
          className="absolute"
        >
          <div className="w-24 h-24 bg-background rounded-2xl flex items-center justify-center">
            <span className="text-4xl">🎉</span>
          </div>
        </motion.div>

        {/* Step 2: Welcome text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: step === 1 ? 1 : 0,
            y: step === 1 ? 0 : 20,
          }}
          transition={{ duration: 0.5 }}
          className="absolute text-center"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            {t("Welcome to")}
          </h1>
          <p className="text-xl text-white/80">{t("Good After Work")}</p>
        </motion.div>

        {/* Step 3: Fun message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: step === 2 ? 1 : 0,
            scale: step === 2 ? 1 : 0.8,
          }}
          transition={{ duration: 0.5 }}
          className="absolute text-center"
        >
          <div className="space-y-4">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <span className="text-6xl">🎊</span>
            </motion.div>
            <p className="text-xl text-white">
              {t("Let's make every after work moment special!")}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
