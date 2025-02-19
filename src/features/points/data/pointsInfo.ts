import { useTranslate } from "@refinedev/core";
import { Coins, Gift, Star, ShoppingBag, Share2, Cake, Tag, Truck, Ticket, Crown, Shield, Zap } from "lucide-react";

export const usePointsInfo = () => {
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

  const spendingMethods = [
    {
      title: t("Discount Vouchers"),
      description: t("Convert points into store discounts"),
      value: "500P = ฿50",
      icon: Tag,
      color: "#007AFF",
      bgColor: "rgba(0, 122, 255, 0.1)",
    },
    {
      title: t("Free Shipping"),
      description: t("Redeem points for free delivery"),
      value: "300P",
      icon: Truck,
      color: "#FF9500",
      bgColor: "rgba(255, 149, 0, 0.1)",
    },
    {
      title: t("Event Tickets"),
      description: t("Get exclusive access to premium events"),
      value: "1000P",
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

  const memberLevels = [
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

  const terms = [
    t("Points must be redeemed in multiples of 100"),
    t("Minimum redemption is 100 points (฿10 value)"),
    t("Points expire 12 months after being earned"),
    t("Points cannot be redeemed for cash"),
    t("Redemption cannot be cancelled or reversed"),
  ];

  return {
    pointRules,
    earnMethods,
    spendingMethods,
    memberLevels,
    terms,
  };
}; 