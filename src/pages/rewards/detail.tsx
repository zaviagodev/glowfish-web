import { useTranslate } from "@refinedev/core";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Barcode as BarcodeIcon,
  Download,
  Gift,
  Ticket,
  QrCode,
  AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Barcode from "react-barcode";
import { useRewards } from "@/hooks/useRewards";
import { useCustomer } from "@/hooks/useCustomer";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/hooks/useStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOrders } from "@/hooks/useOrders";
import GlowfishIcon from "@/components/icons/GlowfishIcon";
import { PageHeader } from "@/components/shared/PageHeader";
import LoadingSpin from "@/components/loading/LoadingSpin";

const RewardDetail = () => {
  const t = useTranslate();
  const { id } = useParams();
  const navigate = useNavigate();
  const { storeName } = useStore();
  const [isRedeemSheetOpen, setIsRedeemSheetOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tabsClassName =
    "w-full rounded-none flex py-4 gap-2 items-center text-[#979797] text-xs font-semibold box-border border-b border-[#282828] !bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white";
  const [codeType, setCodeType] = useState("barcode");

  const {
    rewards,
    loading: rewardsLoading,
    error: rewardsError,
  } = useRewards();

  const {
    customer,
    loading: customerLoading,
    error: customerError,
    refreshCustomer,
  } = useCustomer();

  const { refreshOrders } = useOrders();

  if (rewardsLoading || customerLoading) {
    return <LoadingSpin />;
  }

  if (rewardsError || customerError) {
    return (
      <div className="text-center text-red-500 mt-8">
        {rewardsError || customerError}
      </div>
    );
  }

  const reward = rewards.find((r) => r.id === id);

  if (!reward) {
    return <div className="text-center mt-8">{t("Reward not found")}</div>;
  }

  const imageUrl = reward?.product_images?.[0]?.url || "";
  // The link below is going to be used as the empty state image on the settings page
  // 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f5f5f5"/%3E%3C/svg%3E';

  const pointsRequired = reward.product_variants?.[0]?.points_based_price || 0;
  const customerPoints = customer?.loyalty_points || 0;
  const hasEnoughPoints = customerPoints >= pointsRequired;

  const handleRedeem = async () => {
    if (!hasEnoughPoints) {
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

      // Prepare order items
      const orderItems = [
        {
          variant_id: reward.product_variants[0].id,
          quantity: 1,
          price: reward.product_variants[0].price,
          total: reward.product_variants[0].price,
          points_based_price: reward.product_variants[0].points_based_price,
        },
      ];

      // Create order using place_order function
      const { data: newOrder, error } = await supabase.rpc("place_order", {
        p_store_name: storeName,
        p_customer_id: customer?.id,
        p_status: "pending",
        p_subtotal: reward.product_variants[0].price,
        p_shipping: 0,
        p_tax: 0,
        p_total: reward.product_variants[0].price,
        p_notes: JSON.stringify({
          message: "Reward redemption",
          paymentMethod: "points",
        }),
        p_tags: ["reward", "web"],
        p_applied_coupons: [],
        p_loyalty_points_used: pointsRequired,
        p_shipping_address_id: customer?.addresses?.[0]?.id,
        p_billing_address_id: customer?.addresses?.[0]?.id,
        p_items: orderItems
      });

      if (error) {
        console.error("Order creation error:", error);
        throw new Error(error.message || "Failed to create order");
      }

      if (!newOrder) {
        throw new Error("No order data returned");
      }
      // Refresh customer data to get updated points
      await refreshCustomer();
      // Refresh orders list
      await refreshOrders();

      // Navigate to orders page instead of showing the drawer
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

  return (
    <div className="pb-10">
      <PageHeader className="bg-transparent border-0" />
      {imageUrl ? (
        <img
          src={imageUrl}
          className="w-full h-full aspect-square object-cover"
        />
      ) : (
        <div className="flex items-center justify-center w-full aspect-square overflow-hidden bg-white/20">
          <GlowfishIcon />
        </div>
      )}
      <section className="p-5 bg-background/70 relative backdrop-blur-sm rounded-t-2xl flex flex-col gap-7 -top-20">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">Reward</p>
          <h2 className="text-2xl">{reward.name}</h2>
        </div>

        <div className="grid grid-cols-2">
          <div className="flex flex-col gap-1 pr-7 border-r border-r-[#FFFFFF1A]">
            <p className="text-sm text-muted-foreground">
              {t("Required Points")}
            </p>
            <h2 className="text-orangefocus text-xl font-semibold">
              {pointsRequired.toLocaleString()} {t("points")}
            </h2>
          </div>
          <div className="flex flex-col gap-1 pl-7">
            <p className="text-sm text-muted-foreground">{t("Your Points")}</p>
            <h2 className="page-title">{customerPoints.toLocaleString()}</h2>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-base">{t("Description")}</h2>
          <p className="text-sm text-secondary-foreground font-light">
            {reward.description}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Accordion type="single" collapsible>
            <AccordionItem
              value="item-1"
              className="bg-darkgray border-0 text-sm px-5 py-4 rounded-lg"
            >
              <AccordionTrigger className="p-0">
                {t("How to redeem the reward")}
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-0">
                {t(
                  "Click the Redeem button below and show the code to our staff to claim your reward."
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Accordion type="single" collapsible>
            <AccordionItem
              value="item-1"
              className="bg-darkgray border-0 text-sm px-5 py-4 rounded-lg"
            >
              <AccordionTrigger className="p-0">
                {t("Redemption condition")}
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-0">
                {t(
                  "This reward can only be redeemed once and cannot be combined with other promotions."
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
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
            disabled={isProcessing || !hasEnoughPoints}
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
                {pointsRequired.toLocaleString()} {t("points")}?
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
                  <Barcode value={reward.id} width={2.5} />
                </TabsContent>
                <TabsContent value="qrcode" className="mt-10 text-center">
                  {/* TODO: add ScanQRCode */}
                  QR Code Prototype
                </TabsContent>
                <TabsContent value="coupon-code" className="mt-10">
                  <h3 className="text-center text-2xl font-bold tracking-wider">
                    {reward.id}
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
};

export default RewardDetail;
