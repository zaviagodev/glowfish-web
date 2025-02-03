import { useTranslate } from "@refinedev/core";
import { PageHeader } from "@/components/shared/PageHeader";
import { motion } from "framer-motion";
import { Crown, Star, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper component for dynamic icon rendering
const DynamicIcon = ({
  icon: Icon,
  className,
  style,
}: {
  icon: any;
  className?: string;
  style?: React.CSSProperties;
}) => <Icon className={className} style={style} />;

const MemberLevel = () => {
  const t = useTranslate();

  const levels = [
    {
      name: t("Bronze Member"),
      color: "#B87333",
      bgColor: "rgba(184, 115, 51, 0.1)",
      icon: Star,
      current: true,
      progress: 50,
      pointsToNext: 2500,
      requirements: t("Spend ฿0 - ฿4,999"),
      benefits: [
        { icon: Star, text: t("1x points on all purchases") },
        { icon: Crown, text: t("Birthday bonus points") },
        { icon: Zap, text: t("Member-only events") },
      ],
    },
    {
      name: t("Silver Member"),
      color: "#C0C0C0",
      bgColor: "rgba(192, 192, 192, 0.1)",
      icon: Shield,
      current: false,
      requirements: t("Spend ฿5,000 - ฿9,999"),
      benefits: [
        { icon: Star, text: t("1.5x points on all purchases") },
        { icon: Crown, text: t("Birthday double points") },
        { icon: Zap, text: t("Priority booking for events") },
        { icon: Shield, text: t("Exclusive rewards") },
      ],
    },
    {
      name: t("Gold Member"),
      color: "#FFD700",
      bgColor: "rgba(255, 215, 0, 0.1)",
      icon: Crown,
      current: false,
      requirements: t("Spend ฿10,000+"),
      benefits: [
        { icon: Star, text: t("2x points on all purchases") },
        { icon: Crown, text: t("Birthday triple points") },
        { icon: Zap, text: t("VIP event access") },
        { icon: Shield, text: t("Premium rewards") },
        { icon: Shield, text: t("Priority support") },
      ],
    },
  ];

  return (
    <div className="min-h-dvh bg-background">
      <PageHeader title={t("Member Level")} />

      <div className="pt-14 pb-10">
        {/* Current Level Card */}
        <div className="p-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-darkgray rounded-lg overflow-hidden"
          >
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: levels[0].bgColor }}
                >
                  <DynamicIcon
                    icon={levels[0].icon}
                    className="w-6 h-6"
                    style={{ color: levels[0].color }}
                  />
                </div>
                <div>
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: levels[0].color }}
                  >
                    {levels[0].name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {levels[0].requirements}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("Next Tier")}
                  </span>
                  <span className="font-medium">{levels[1].name}</span>
                </div>
                <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: levels[0].color }}
                    initial={{ width: "0%" }}
                    animate={{ width: "50%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("{{points}} points until next tier", {
                    points: levels[0].pointsToNext.toLocaleString(),
                  })}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* All Levels */}
        <div className="px-5">
          <h3 className="text-sm font-medium text-muted-foreground tracking-wide mb-4">
            {t("All Levels")}
          </h3>
          <div className="space-y-4">
            {levels.map((level, index) => (
              <motion.div
                key={level.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "rounded-lg overflow-hidden transition-all border border-input",
                  level.current ? "bg-darkgray" : ""
                )}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: level.bgColor }}
                      >
                        <DynamicIcon
                          icon={level.icon}
                          className="w-5 h-5"
                          style={{ color: level.color }}
                        />
                      </div>
                      <div>
                        <h3
                          className="font-semibold"
                          style={{ color: level.color }}
                        >
                          {level.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {level.requirements}
                        </p>
                      </div>
                    </div>
                    {level.current && (
                      <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                        {t("Current")}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {level.benefits.map((benefit, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <DynamicIcon
                          icon={benefit.icon}
                          className="w-4 h-4"
                          style={{ color: level.color }}
                        />
                        <span>{benefit.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberLevel;
