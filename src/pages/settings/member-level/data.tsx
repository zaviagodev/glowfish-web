import { useTranslate } from "@refinedev/core";
import { Crown, Shield, Star, Zap } from "lucide-react";

const memberLevelData = () => {
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

  return levels;
};

export default memberLevelData;
