import { useTranslate } from "@refinedev/core";
import { PageHeader } from "@/components/shared/PageHeader";
import { motion } from "framer-motion";
import spendPointsData from "./data";

const HowToSpendPoints = () => {
  const t = useTranslate();
  const { pointsValue, spendingMethods, spendPointsTerms } = spendPointsData();
  return (
    <div className="bg-background">
      <PageHeader title={t("How to Spend Points")} />

      <div className="pt-14 pb-10">
        {/* Points Value Card */}
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-darkgray rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: pointsValue.bgColor }}
              >
                <pointsValue.icon
                  className="w-6 h-6"
                  style={{ color: pointsValue.color }}
                />
              </div>
              <div>
                <h3
                  className="font-medium"
                  style={{ color: pointsValue.color }}
                >
                  {pointsValue.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {pointsValue.description}
                </p>
                <p
                  className="text-sm font-medium mt-1"
                  style={{ color: pointsValue.color }}
                >
                  {pointsValue.value}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Redemption Methods */}
        <div className="px-5">
          <motion.h2
            className="text-sm font-medium tracking-wide mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {t("Ways to Redeem")}
          </motion.h2>
          <div className="space-y-4">
            {spendingMethods.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-darkgray rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: method.bgColor }}
                  >
                    <method.icon
                      className="w-6 h-6"
                      style={{ color: method.color }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium truncate">{method.title}</h3>
                      <span
                        className="text-sm font-medium px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: method.bgColor,
                          color: method.color,
                        }}
                      >
                        {method.value}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {method.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="px-5 mt-8">
          <motion.h2
            className="text-sm font-medium tracking-wide mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {t("Terms & Conditions")}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="rounded-lg space-y-3 pl-2"
          >
            {spendPointsTerms.map((term, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {term}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HowToSpendPoints;
