import { useTranslate } from "@refinedev/core";
import { PageHeader } from "@/components/shared/PageHeader";
import { motion } from "framer-motion";
import { Gift, Tag, Truck, Crown, Ticket, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

const HowToSpendPoints = () => {
  const t = useTranslate();

  const pointsValue = {
    icon: Coins,
    title: t("Points Value"),
    description: t("Convert your points to discounts"),
    value: "100 Points = ฿10",
    color: "#34C759",
    bgColor: "rgba(52, 199, 89, 0.1)",
  };

  const spendingMethods = [
    {
      title: t("Discount Vouchers"),
      description: t("Convert points into store discounts"),
      value: "500P = ฿50" /* 500 points = ฿50 */,
      icon: Tag,
      color: "#007AFF",
      bgColor: "rgba(0, 122, 255, 0.1)",
    },
    {
      title: t("Free Shipping"),
      description: t("Redeem points for free delivery"),
      value: "300P" /* 300 points */,
      icon: Truck,
      color: "#FF9500",
      bgColor: "rgba(255, 149, 0, 0.1)",
    },
    {
      title: t("Event Tickets"),
      description: t("Get exclusive access to premium events"),
      value: "1000P" /* 1000 points */,
      icon: Ticket,
      color: "#AF52DE",
      bgColor: "rgba(175, 82, 222, 0.1)",
    },
    {
      title: t("Birthday Bonus"),
      description: t("Double value during your birthday month"),
      value: "2x value",
      icon: Gift,
      color: "#FF2D55",
      bgColor: "rgba(255, 45, 85, 0.1)",
    },
    {
      title: t("VIP Rewards"),
      description: t("Special rewards based on your tier"),
      value: t("Tier based"),
      icon: Crown,
      color: "#5856D6",
      bgColor: "rgba(88, 86, 214, 0.1)",
    },
  ];

  const terms = [
    t("Points must be redeemed in multiples of 100"),
    t("Minimum redemption is 100 points (฿10 value)"),
    t("Points expire 12 months after being earned"),
    t("Points cannot be redeemed for cash"),
    t("Redemption cannot be cancelled or reversed"),
  ];

  return (
    <div className="min-h-screen bg-background">
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
        <div className="px-6">
          <motion.h2
            className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4"
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
        <div className="px-6 mt-8">
          <motion.h2
            className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4"
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
            className="bg-darkgray rounded-lg p-4 space-y-3"
          >
            {terms.map((term, index) => (
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
