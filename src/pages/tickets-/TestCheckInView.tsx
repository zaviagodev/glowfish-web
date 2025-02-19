import { useTranslate } from "@refinedev/core";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Users, CheckCircle2, Clock, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TestCheckInViewProps {
  onClose: (e?: any) => void;
  onComplete: (e?: any) => void;
}

interface TestCase {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  data: {
    guests: Array<{
      name: string;
      seat: string;
    }>;
    expectedDuration: number;
  };
}

export function TestCheckInView({ onClose, onComplete }: TestCheckInViewProps) {
  const t = useTranslate();
  const [selectedTest, setSelectedTest] = useState<TestCase | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const testCases: TestCase[] = [
    {
      id: "single",
      title: t("Single Guest Check-in"),
      description: t("Test basic check-in flow"),
      icon: Users,
      color: "#007AFF",
      bgColor: "rgba(0, 122, 255, 0.1)",
      data: {
        guests: [{ name: "John Doe", seat: "A1" }],
        expectedDuration: 2000,
      },
    },
    {
      id: "group",
      title: t("Group Check-in"),
      description: t("Test multiple guest check-in"),
      icon: Users,
      color: "#34C759",
      bgColor: "rgba(52, 199, 89, 0.1)",
      data: {
        guests: [
          { name: "Alice Smith", seat: "B1" },
          { name: "Bob Johnson", seat: "B2" },
          { name: "Carol White", seat: "B3" },
        ],
        expectedDuration: 3000,
      },
    },
    {
      id: "slow",
      title: t("Slow Network Test"),
      description: t("Test with network delay"),
      icon: Clock,
      color: "#FF9500",
      bgColor: "rgba(255, 149, 0, 0.1)",
      data: {
        guests: [{ name: "David Brown", seat: "C1" }],
        expectedDuration: 5000,
      },
    },
    {
      id: "error",
      title: t("Error Handling Test"),
      description: t("Test error scenarios"),
      icon: AlertTriangle,
      color: "#FF3B30",
      bgColor: "rgba(255, 59, 48, 0.1)",
      data: {
        guests: [{ name: "Error Test", seat: "ERROR" }],
        expectedDuration: 2000,
      },
    },
  ];

  const handleTestSelect = async (test: TestCase) => {
    setSelectedTest(test);
    setIsProcessing(true);

    // Simulate processing
    await new Promise((resolve) =>
      setTimeout(resolve, test.data.expectedDuration)
    );

    if (test.id === "error") {
      // Simulate error
      setIsProcessing(false);
      setSelectedTest(null);
      alert(t("Check-in failed: Test error scenario"));
      return;
    }

    setIsProcessing(false);
    setIsCompleted(true);
  };

  const handleComplete = () => {
    setSelectedTest(null);
    setIsCompleted(false);
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[8px]"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="absolute bottom-0 left-0 right-0 bg-background rounded-t-[20px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-5 py-3 text-left border-b">
          <div className="absolute left-1/2 -top-3 w-12 h-1 bg-[#E5E5EA] rounded-full transform -translate-x-1/2" />
          <h2 className="text-lg font-semibold">{t("Test Check-in")}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("Select a test scenario")}
          </p>

          <button
            className="bg-white/[12%] p-1 absolute right-4 top-3 rounded-full opacity-70"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!selectedTest ? (
            // Test Selection View
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 space-y-4"
            >
              {testCases.map((test, index) => (
                <motion.button
                  key={test.id}
                  className="w-full text-left"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { delay: index * 0.1 },
                  }}
                  onClick={() => handleTestSelect(test)}
                >
                  <div
                    className={cn(
                      "bg-darkgray rounded-lg p-4",
                      "hover:border-[#D1D1D6] transition-colors"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: test.bgColor }}
                      >
                        <test.icon
                          className="w-6 h-6"
                          style={{ color: test.color }}
                        />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">{test.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {test.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            // Processing/Completion View
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <div className="flex flex-col items-center text-center">
                {isProcessing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent mb-4"
                    />
                    <h3 className="text-lg font-semibold mb-2">
                      {t("Processing Check-in")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("Please wait...")}
                    </p>
                  </>
                ) : isCompleted ? (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      className="w-16 h-16 rounded-full bg-[#34C759]/10 flex items-center justify-center mb-4"
                    >
                      <CheckCircle2 className="w-8 h-8 text-[#34C759]" />
                    </motion.div>
                    <h3 className="text-lg font-semibold mb-4">
                      {t("Check-in Successful!")}
                    </h3>
                    <div className="bg-darkgray rounded-lg p-4 w-full mb-6">
                      <div className="space-y-4">
                        {selectedTest.data.guests.map((guest, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <div className="text-sm">
                              <div className="font-medium">{guest.name}</div>
                              <div className="text-muted-foreground">
                                {t("Seat")}: {guest.seat}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-[#34C759]">
                              <CheckCircle2 className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {t("Checked In")}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>

              {isCompleted && (
                <Button
                  className="w-full h-12 bg-black text-white hover:bg-black/90"
                  onClick={handleComplete}
                >
                  {t("Complete")}
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
