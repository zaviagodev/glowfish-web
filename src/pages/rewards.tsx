import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslate } from "@refinedev/core";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Barcode as BarcodeIcon,
  Calendar,
  Download,
  Gift,
  MapPin,
  QrCode,
  Tag,
  Ticket,
  AlertCircle,
} from "lucide-react";
import Barcode from "react-barcode";

import { useCustomer } from "@/hooks/useCustomer";
import { useStore } from "@/hooks/useStore";
import { useOrders } from "@/features/orders";
import { useRewards, useReward } from "@/features/rewards/hooks/useRewards";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/PageHeader";
import LoadingSpin from "@/components/loading/LoadingSpin";
import GlowfishIcon from "@/components/icons/GlowfishIcon";
import cardReward from "@/img/my-card.svg";
import RewardAccordions from "@/features/rewards/components/RewardAccordions";
import GoodAfterWorkCard from "@/components/icons/GoodAfterWorkCard";

const RewardsPage = () => {
  const t = useTranslate();
  const navigate = useNavigate();
  const { id } = useParams();
  const { storeName } = useStore();
  const [isRedeemSheetOpen, setIsRedeemSheetOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeType, setCodeType] = useState("barcode");
  const tabsClassName =
    "w-full rounded-none flex py-4 gap-2 items-center text-[#979797] text-xs font-semibold box-border border-b border-[#282828] !bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white";

  const {
    rewards,
    loading: rewardsLoading,
    error: rewardsError,
  } = useRewards();

  const {
    reward: selectedReward,
    loading: rewardLoading,
    error: rewardError,
  } = useReward(id || "");

  const {
    customer,
    loading: customerLoading,
    error: customerError,
    refreshCustomer,
  } = useCustomer();

  const { refreshOrders } = useOrders();

  if (customerLoading || rewardsLoading || (id && rewardLoading)) {
    return <LoadingSpin />;
  }

  if (customerError || rewardsError || rewardError) {
    return (
      <div className="text-center text-red-500 mt-8">
        {customerError || rewardsError || rewardError}
      </div>
    );
  }

  const customerData = customer;
  const fullName = customerData
    ? `${customerData.first_name} ${customerData.last_name}`.trim()
    : "User";

  const hasPoints =
    customerData?.loyalty_points && customerData.loyalty_points > 0;

  const hasRewards = rewards && rewards.length > 0;

  const rewardEvents = rewards.map((reward) => ({
    id: reward.id,
    image: reward?.product_images?.[0]?.url || "",
    title: reward.name,
    description: reward.description,
    location: reward.location,
    date: reward.date,
    price: reward.product_variants?.[0]?.price,
    points: reward.product_variants?.[0]?.points_based_price,
  }));

  const handleRedeem = async () => {
    if (!selectedReward || !selectedReward.product_variants?.[0]) return;

    const pointsRequired =
      selectedReward.product_variants[0].points_based_price;
    if (customerData.loyalty_points < pointsRequired) {
      setError(t("You don't have enough points to redeem this reward"));
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const variant = selectedReward.product_variants[0];
      const orderItems = [
        {
          variant_id: variant.id,
          quantity: 1,
          price: variant.price,
          total: variant.price,
          points_based_price: variant.points_based_price,
        },
      ];

      const { data: newOrder, error } = await supabase.rpc("place_order", {
        p_store_name: storeName,
        p_customer_id: customerData?.id,
        p_status: "pending",
        p_subtotal: variant.price,
        p_shipping: 0,
        p_tax: 0,
        p_total: variant.price,
        p_notes: JSON.stringify({
          message: "Reward redemption",
          paymentMethod: "points",
        }),
        p_tags: ["reward", "web"],
        p_applied_coupons: [],
        p_loyalty_points_used: pointsRequired,
        p_shipping_address_id: customerData?.addresses?.[0]?.id,
        p_billing_address_id: customerData?.addresses?.[0]?.id,
        p_items: orderItems,
      });

      if (error) throw new Error(error.message || "Failed to create order");
      if (!newOrder) throw new Error("No order data returned");

      await refreshCustomer();
      await refreshOrders();

      setIsConfirmDialogOpen(false);
      navigate("/my-orders");
    } catch (error) {
      console.error("Error redeeming reward:", error);
      setError(
        t(
          error instanceof Error
            ? error.message
            : "Failed to redeem reward. Please try again."
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Render detail view if a reward is selected
  if (id && selectedReward) {
    return (
      <div className="pb-10">
        <PageHeader className="bg-transparent border-0" />
        {selectedReward.product_images?.[0]?.url ? (
          <img
            src={selectedReward.product_images[0].url}
            className="w-full h-full aspect-square object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full aspect-square overflow-hidden bg-black">
            <GlowfishIcon />
          </div>
        )}
        <section className="p-5 bg-background/70 relative backdrop-blur-sm rounded-t-2xl flex flex-col gap-7 -top-20">
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">Reward</p>
            <h2 className="text-2xl">{selectedReward.name}</h2>
          </div>

          <div className="grid grid-cols-2">
            <div className="flex flex-col gap-1 pr-7 border-r border-r-[#FFFFFF1A]">
              <p className="text-sm text-muted-foreground">
                {t("Required Points")}
              </p>
              <h2 className="text-orangefocus text-xl font-semibold">
                {selectedReward.product_variants?.[0]?.points_based_price?.toLocaleString()}{" "}
                {t("points")}
              </h2>
            </div>
            <div className="flex flex-col gap-1 pl-7">
              <p className="text-sm text-muted-foreground">
                {t("Your Points")}
              </p>
              <h2 className="page-title">
                {customerData?.loyalty_points?.toLocaleString()}{" "}
                {customerData?.loyalty_points === 1 ? "point" : "points"}
              </h2>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-base">{t("Description")}</h2>
            <p className="text-sm text-secondary-foreground font-light">
              {selectedReward.description}
            </p>
          </div>

          <RewardAccordions />
        </section>

        {error && (
          <div className="px-5 mb-4">
            <div className="bg-red-500/10 text-red-500 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <footer className="btn-footer flex flex-col gap-7 z-[50]">
          <Dialog
            open={isConfirmDialogOpen}
            onOpenChange={setIsConfirmDialogOpen}
          >
            <Button
              disabled={
                isProcessing ||
                customerData.loyalty_points <
                  (selectedReward.product_variants?.[0]?.points_based_price ||
                    0)
              }
              onClick={() => setIsConfirmDialogOpen(true)}
              className="main-btn !bg-mainbutton rounded-full flex gap-2 items-center justify-center"
            >
              <Gift />
              {isProcessing ? t("Processing...") : t("Redeem Reward")}
            </Button>
            <DialogContent className="w-[90%] rounded-lg">
              <DialogHeader>
                <DialogTitle>{t("Confirm Redemption")}</DialogTitle>
                <DialogDescription>
                  {t("Are you sure you want to redeem this reward for")}{" "}
                  {selectedReward.product_variants?.[0]?.points_based_price?.toLocaleString()}{" "}
                  {t("points")}?
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-4 mt-4">
                <Button
                  variant="ghost"
                  onClick={() => setIsConfirmDialogOpen(false)}
                  className="secondary-btn w-full"
                >
                  {t("Cancel")}
                </Button>
                <Button
                  onClick={handleRedeem}
                  disabled={isProcessing}
                  className="main-btn w-full"
                >
                  {isProcessing ? t("Processing...") : t("Confirm")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Sheet open={isRedeemSheetOpen} onOpenChange={setIsRedeemSheetOpen}>
            <SheetContent
              className="h-3/4 border-0 outline-none bg-background rounded-t-2xl p-5 flex flex-col justify-between"
              side="bottom"
            >
              <div>
                <h3 className="text-lg font-semibold text-center mb-4">
                  {t("Redeem Your Reward")}
                </h3>
                <p className="text-sm text-[#979797] text-center mb-6">
                  {t("Show this code to the staff to redeem your reward")}
                </p>
                <Tabs defaultValue={codeType} onValueChange={setCodeType}>
                  <TabsList className="w-full bg-transparent">
                    <TabsTrigger value="barcode" className={tabsClassName}>
                      <BarcodeIcon />
                      {t("Barcode")}
                    </TabsTrigger>
                    <TabsTrigger value="qrcode" className={tabsClassName}>
                      <QrCode />
                      {t("QR Code")}
                    </TabsTrigger>
                    <TabsTrigger value="coupon-code" className={tabsClassName}>
                      <Ticket />
                      {t("Code")}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent
                    value="barcode"
                    className="mt-10 flex justify-center"
                  >
                    <Barcode value={selectedReward.id} width={2.5} />
                  </TabsContent>
                  <TabsContent value="qrcode" className="mt-10 text-center">
                    {/* TODO: add ScanQRCode */}
                    QR Code Prototype
                  </TabsContent>
                  <TabsContent value="coupon-code" className="mt-10">
                    <h3 className="text-center text-2xl font-bold tracking-wider">
                      {selectedReward.id}
                    </h3>
                  </TabsContent>
                </Tabs>
              </div>
              <footer className="space-y-4 p-5">
                <Button className="!bg-transparent w-full flex items-center gap-2">
                  <Download />
                  {t("Download Code")}
                </Button>
                <p className="text-sm text-[#979797] text-center">
                  {t("This code is valid for one-time use only")}
                </p>
              </footer>
            </SheetContent>
          </Sheet>
        </footer>
      </div>
    );
  }

  // Render list view
  return (
    <>
      <PageHeader title={t("Your card")} />
      <section className="pt-14">
        <div className="flex items-center justify-between p-5 pb-0">
          <h1 className="font-semibold text-[28px] m-0">
            {t("Hello")},{" "}
            <span className="text-mainbutton">
              {customerData?.first_name || "User"}
            </span>
          </h1>
          <Avatar className="h-[50px] w-[50px]">
            <AvatarImage
              src={customerData?.avatar_url || "https://github.com/shadcn.png"}
            />
            <AvatarFallback>
              {fullName?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="member-card h-[250px] relative">
          {cardReward && (
            <img
              src={cardReward}
              className="absolute z-0 w-full h-full object-cover opacity-75"
            />
          )}
          <div className="flex justify-between items-center py-5 px-[30px] z-5 relative">
            <h3 className="font-semibold text-xl tracking-[-0.4px]">
              {t("Good After Work")}
            </h3>
            <h3 className="font-semibold text-xl">
              {hasPoints
                ? `${customerData.loyalty_points.toLocaleString()} ${
                    customerData.loyalty_points === 1 ? "point" : "points"
                  }`
                : "0 points"}
            </h3>
          </div>
          <div className="absolute z-[99] right-[30px] bottom-5 flex items-center w-fit text-2xl gap-2 text-mainbutton font-semibold">
            {/* <GlowfishIcon className="w-[72px]" />| Glowfish */}
            <GoodAfterWorkCard />
          </div>
        </div>

        <div className="px-5 pb-7">
          <h3 className="page-title mb-4">{t("Rewards")}</h3>
          {hasRewards ? (
            <div className="grid grid-cols-2 gap-4">
              {rewardEvents.map((reward) => (
                <div
                  key={reward.id}
                  onClick={() => navigate(`/rewards/${reward.id}`)}
                  className="relative overflow-hidden rounded-2xl cursor-pointer w-full bg-card h-full border border-input transition-all duration-200 hover:scale-[0.98] active:scale-[0.97] text-sm"
                >
                  <div
                    className={cn(
                      "relative overflow-hidden max-h-[220px] h-[40vw] w-full",
                      {
                        "bg-white/10 flex items-center justify-center":
                          !reward.image,
                      }
                    )}
                  >
                    {reward.image ? (
                      <img
                        src={reward.image}
                        alt={reward.title}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <GlowfishIcon />
                    )}
                  </div>

                  <div className="p-4 space-y-2 bg-card">
                    <div>
                      <h3 className="font-semibold text-foreground line-clamp-1">
                        {reward.title}
                      </h3>
                    </div>
                    {reward.location && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span className="line-clamp-1">{reward.location}</span>
                      </div>
                    )}
                    {reward.date && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{reward.date}</span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-2 text-lg font-semibold text-orangefocus">
                      <Tag className="w-4 h-4 stroke-[2.5]" />
                      <span>
                        {reward.points
                          ? `${reward.points} ${
                              reward.points === 1 ? "point" : "points"
                            }`
                          : t("Free")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <Gift className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-center">
                {t("No rewards available at the moment")}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default RewardsPage;
