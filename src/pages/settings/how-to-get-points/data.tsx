import { useTranslate } from "@refinedev/core";
import { Cake, Coins, Gift, Share2, ShoppingBag, Star } from "lucide-react";

const getPointsData = () => {
  const t = useTranslate();
  const pointRules = [
    {
      type: "earn",
      title: t("Earn Points"),
      description: "฿1 = 1 Point",
      icon: Coins,
      color: "#34C759",
      bgColor: "rgba(52, 199, 89, 0.1)",
    },
    {
      type: "spend",
      title: t("Spend Points"),
      description: "100 Points = ฿10",
      icon: Gift,
      color: "#FF3B30",
      bgColor: "rgba(255, 59, 48, 0.1)",
    },
  ];
  const earnMethods = [
    {
      title: t("Make a Purchase"),
      description: t("Earn 1 point for every ฿1 spent"),
      points: "1 point/฿1",
      icon: ShoppingBag,
      color: "#007AFF",
      bgColor: "rgba(0, 122, 255, 0.1)",
    },
    {
      title: t("First Purchase Bonus"),
      description: t("Get bonus points on your first order"),
      points: "100 points",
      icon: Star,
      color: "#FF9500",
      bgColor: "rgba(255, 149, 0, 0.1)",
    },
    {
      title: t("Birthday Bonus"),
      description: t("Special points bonus on your birthday"),
      points: "200 points",
      icon: Cake,
      color: "#AF52DE",
      bgColor: "rgba(175, 82, 222, 0.1)",
    },
    {
      title: t("Share & Earn"),
      description: t("Share products on social media"),
      points: "20 points",
      icon: Share2,
      color: "#5856D6",
      bgColor: "rgba(88, 86, 214, 0.1)",
    },
  ];
  const getPointsTerms = [
    t("Points are valid for 12 months from the date of issue"),
    t("Points cannot be transferred or exchanged for cash"),
    t("Points can only be earned on paid purchases"),
    t("Points are calculated based on the final paid amount after discounts"),
  ];

  return {
    pointRules,
    earnMethods,
    getPointsTerms,
  };
};

export default getPointsData;
