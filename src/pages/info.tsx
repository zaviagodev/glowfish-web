import { useTranslate } from "@refinedev/core";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { usePointsInfo } from "@/features/points/data/pointsInfo";
import DynamicIcon from "@/components/icons/DynamicIcon";
import { useLocation } from "react-router-dom";

const InfoPage = () => {
  const t = useTranslate();
  const location = useLocation();
  const { pointRules, earnMethods, spendingMethods, memberLevels, terms } = usePointsInfo();

  // Determine which section to show based on the URL
  const path = location.pathname;
  const showEarnPoints = path === "/info/how-to-get-points" || path === "/info";
  const showSpendPoints = path === "/info/how-to-spend-points";
  const showMemberLevel = path === "/info/member-level";

  return (
    <div className="bg-background">
      <PageHeader 
        title={t(
          showEarnPoints 
            ? "How to Get Points" 
            : showSpendPoints 
            ? "How to Spend Points" 
            : "Member Level"
        )} 
      />

      <div className="pt-14 pb-10 px-5 space-y-8">
        {/* Point Rules - Show only on earn points page */}
        {showEarnPoints && (
          <>
            <div className="space-y-4">
              <h2 className="text-sm font-medium tracking-wide">{t("Point Rules")}</h2>
              {pointRules.map((rule) => (
                <motion.div
                  key={rule.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-darkgray rounded-lg p-4"
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
            </div>

            {/* Earn Methods */}
            <div className="space-y-4">
              <h2 className="text-sm font-medium tracking-wide">{t("Ways to Earn")}</h2>
              {earnMethods.map((method, index) => (
                <motion.div
                  key={method.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-darkgray rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
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
          </>
        )}

        {/* Spending Methods - Show only on spend points page */}
        {showSpendPoints && (
          <>
            <div className="space-y-4">
              <h2 className="text-sm font-medium tracking-wide">{t("Ways to Spend")}</h2>
              {spendingMethods.map((method, index) => (
                <motion.div
                  key={method.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-darkgray rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
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

            {/* Terms */}
            <div className="space-y-4">
              <h2 className="text-sm font-medium tracking-wide">{t("Terms")}</h2>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-darkgray rounded-lg p-4"
              >
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {terms.map((term, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </>
        )}

        {/* Member Levels - Show only on member level page */}
        {showMemberLevel && (
          <div className="space-y-4">
            <h2 className="text-sm font-medium tracking-wide">{t("Member Levels")}</h2>
            {memberLevels.map((level, index) => (
              <motion.div
                key={level.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-darkgray rounded-lg overflow-hidden"
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: level.bgColor }}
                    >
                      <DynamicIcon
                        icon={level.icon}
                        className="w-6 h-6"
                        style={{ color: level.color }}
                      />
                    </div>
                    <div>
                      <h3
                        className="text-lg font-semibold"
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
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {t("Next Tier")}
                        </span>
                        <span className="font-medium">
                          {memberLevels[index + 1]?.name}
                        </span>
                      </div>
                      <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: level.color }}
                          initial={{ width: "0%" }}
                          animate={{ width: `${level.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("{{points}} points until next tier", {
                          points: level.pointsToNext?.toLocaleString(),
                        })}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">{t("Benefits")}</h4>
                    <ul className="space-y-2">
                      {level.benefits.map((benefit, benefitIndex) => (
                        <li
                          key={benefitIndex}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <benefit.icon
                            className="w-4 h-4"
                            style={{ color: level.color }}
                          />
                          <span>{benefit.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoPage; 