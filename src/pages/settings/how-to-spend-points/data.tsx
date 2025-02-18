import { useTranslate } from "@refinedev/core";
import { Coins, Crown, Gift, Tag, Ticket, Truck } from "lucide-react";

const spendPointsData = () => {
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
  const spendPointsTerms = [
    t("Points must be redeemed in multiples of 100"),
    t("Minimum redemption is 100 points (฿10 value)"),
    t("Points expire 12 months after being earned"),
    t("Points cannot be redeemed for cash"),
    t("Redemption cannot be cancelled or reversed"),
  ];

  return { pointsValue, spendingMethods, spendPointsTerms };
};

export default spendPointsData;
