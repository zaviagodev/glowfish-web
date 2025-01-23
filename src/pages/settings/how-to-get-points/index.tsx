import { useTranslate } from "@refinedev/core";
import { PageHeader } from "@/components/shared/PageHeader";
import { motion } from "framer-motion";
import { Coins, Gift, Star, ShoppingBag, Share2, Cake } from "lucide-react";
import { cn } from "@/lib/utils";

const HowToGetPoints = () => {
  const t = useTranslate();

  const pointRules = [
    {
      type: "earn",
      title: t("Earn Points"),
      description: "฿1 = 1 Point",
      icon: Coins,
      color: "#34C759",
      bgColor: "rgba(52, 199, 89, 0.1)"
    },
    {
      type: "spend",
      title: t("Spend Points"),
      description: "100 Points = ฿10",
      icon: Gift,
      color: "#FF3B30",
      bgColor: "rgba(255, 59, 48, 0.1)"
    }
  ];

  const earnMethods = [
    {
      title: t("Make a Purchase"),
      description: t("Earn 1 point for every ฿1 spent"),
      points: "1 point/฿1",
      icon: ShoppingBag,
      color: "#007AFF",
      bgColor: "rgba(0, 122, 255, 0.1)"
    },
    {
      title: t("First Purchase Bonus"),
      description: t("Get bonus points on your first order"),
      points: "100 points",
      icon: Star,
      color: "#FF9500",
      bgColor: "rgba(255, 149, 0, 0.1)"
    },
    {
      title: t("Birthday Bonus"),
      description: t("Special points bonus on your birthday"),
      points: "200 points",
      icon: Cake,
      color: "#AF52DE",
      bgColor: "rgba(175, 82, 222, 0.1)"
    },
    {
      title: t("Share & Earn"),
      description: t("Share products on social media"),
      points: "20 points",
      icon: Share2,
      color: "#5856D6",
      bgColor: "rgba(88, 86, 214, 0.1)"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title={t("How to Get Points")} />

      <div className="pt-14 pb-32">
        {/* Points Rules */}
        <div className="p-6">
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {pointRules.map((rule, index) => (
              <motion.div
                key={rule.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[rgba(245,245,245,0.5)] rounded-lg border border-[#E5E5E5] p-4"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: rule.bgColor }}
                  >
                    <rule.icon 
                      className="w-6 h-6"
                      style={{ color: rule.color }}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium" style={{ color: rule.color }}>
                      {rule.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {rule.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Ways to Earn */}
        <div className="px-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
            {t("Ways to Earn Points")}
          </h2>
          <div className="space-y-4">
            {earnMethods.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-[rgba(245,245,245,0.5)] rounded-lg border border-[#E5E5E5] p-4"
              >
                <div className="flex items-center gap-4">
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
                      <h3 className="font-medium truncate">
                        {method.title}
                      </h3>
                      <span 
                        className="text-sm font-medium px-2 py-1 rounded-full"
                        style={{ 
                          backgroundColor: method.bgColor,
                          color: method.color
                        }}
                      >
                        {method.points}
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
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
            {t("Terms & Conditions")}
          </h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-[rgba(245,245,245,0.5)] rounded-lg border border-[#E5E5E5] p-4 space-y-3"
          >
            {[
              t("Points are valid for 12 months from the date of issue"),
              t("Points cannot be transferred or exchanged for cash"),
              t("Points can only be earned on paid purchases"),
              t("Points are calculated based on the final paid amount after discounts")
            ].map((term, index) => (
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

export default HowToGetPoints;