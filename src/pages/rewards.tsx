import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslate } from "@refinedev/core";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ChevronRight,
  ChevronLeft,
  CircleParking,
  CircleDollarSign,
  CheckCircle2,
} from "lucide-react";
import Barcode from "react-barcode";
import { useCustomer } from "@/hooks/useCustomer";
import { useStore } from "@/hooks/useStore";
import { useOrders } from "@/features/orders";
import { useRewards, useReward } from "@/features/rewards/hooks/useRewards";
import { supabase } from "@/lib/supabase";
import { cn, makeTwoDecimals } from "@/lib/utils";
import { PageHeader } from "@/components/shared/PageHeader";
import GlowfishIcon from "@/components/icons/GlowfishIcon";
import cardReward from "@/img/my-card.svg";
import RewardAccordions from "@/features/rewards/components/RewardAccordions";
import GoodAfterWorkCard from "@/components/icons/GoodAfterWorkCard";
import NoItemsComp from "@/components/ui/no-items";
import ItemCarousel from "@/components/ui/item-carousel";
import RewardPageSkeletons from "@/components/skeletons/RewardPageSkeletons";
import LongParagraph from "@/components/ui/long-paragraph";
import { ProductVariant } from "@/type/type 2";
import { VariantDrawer } from "@/features/home/components/VariantDrawer";
import { set } from "date-fns";

const RewardsPage = () => {
  const t = useTranslate();
  const navigate = useNavigate();
  const { id } = useParams();
  const { storeName } = useStore();
  const [isRedeemSheetOpen, setIsRedeemSheetOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isGoingToConfirm, setIsGoingToConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
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
    return <RewardPageSkeletons />;
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
      if (selectedOption === "price") {
        navigate("/checkout", {
          state: {
            selectedItems: orderItems,
          },
        });
      } else {
        setIsSuccessful(true);
      }
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

  const getPriceDisplay = () => {
    const { product_variants } = selectedReward;
    const { price } = product_variants?.[0] || { price: 0 };
    if (!product_variants || product_variants.length === 0) {
      return price === 0 ? t("free") : `฿${Number(price).toLocaleString()}`;
    }

    const prices = product_variants.map((v: ProductVariant) => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return minPrice === 0
        ? t("free")
        : `฿${makeTwoDecimals(minPrice).toLocaleString()}`;
    }

    return `${
      minPrice === 0
        ? t("free")
        : `฿${makeTwoDecimals(minPrice).toLocaleString()}`
    } - ฿${makeTwoDecimals(maxPrice).toLocaleString()}`;
  };

  const getPointsDisplay = () => {
    const { product_variants } = selectedReward;
    const { points_based_price } = product_variants?.[0] || {
      points_based_price: 0,
    };
    if (!product_variants || product_variants.length === 0) {
      return Number(points_based_price).toLocaleString();
    }

    const points = product_variants.map(
      (v: ProductVariant) => v.points_based_price
    );

    if (points) {
      const minPoint = Math.min(...points);
      const maxPoint = Math.max(...points);

      if (minPoint === maxPoint) {
        return `${minPoint.toLocaleString()}`;
      }

      return `${minPoint.toLocaleString()} - ${maxPoint.toLocaleString()}`;
    } else {
      return 0;
    }
  };

  {
    /* Product variants have no compare at price, which will set the discount price range */
  }
  const getCompareAtPriceDisplay = () => {
    const { product_variants } = selectedReward;
    if (!product_variants || product_variants.length === 0) {
      return null;
    }

    const comparePrices = product_variants
      .filter((v) => v.compare_at_price && v.compare_at_price > 0)
      .map((v) => v.compare_at_price!);

    if (comparePrices.length === 0) return null;

    const minComparePrice = Math.min(...comparePrices);
    const maxComparePrice = Math.max(...comparePrices);

    if (minComparePrice === maxComparePrice) {
      return `฿${makeTwoDecimals(minComparePrice).toLocaleString()}`;
    }

    return `฿${makeTwoDecimals(
      minComparePrice
    ).toLocaleString()} - ฿${makeTwoDecimals(
      maxComparePrice
    ).toLocaleString()}`;
  };

  const redeemOptions = [
    {
      name: "points",
      icon: <CircleParking className="h-4 w-4" />,
      value: "Points",
      amount: selectedReward?.product_variants?.[0]?.points_based_price,
      selected: selectedOption === "points",
      disabled:
        customerData.loyalty_points <
        selectedReward?.product_variants?.[0]?.points_based_price,
    },
    {
      name: "price",
      icon: <CircleDollarSign className="h-4 w-4" />,
      value: "Price",
      amount: `฿${selectedReward?.product_variants?.[0]?.price}`,
      selected: selectedOption === "price",
      disabled: false,
    },
  ];

  const handleConfirmRedeem = () => {
    isGoingToConfirm ? handleRedeem() : setIsGoingToConfirm(true);
  };

  const handleSuccessful = (link: string | number) => {
    setIsSuccessful(false);
    setIsGoingToConfirm(false);
    setIsConfirmDialogOpen(false);
    setSelectedOption("");
    setError(null);
    navigate(link as string);
  };

  const checkIfNoPriceOrPoints = (check: string) => {
    switch (check) {
      case "price":
        return selectedReward?.product_variants?.[0]?.price === 0;
      case "points":
        return selectedReward?.product_variants?.[0]?.points_based_price === 0;
      case "both":
        return (
          selectedReward?.product_variants?.[0]?.price === 0 &&
          selectedReward?.product_variants?.[0]?.points_based_price === 0
        );
      default:
        return false;
    }
  };

  const noPriceAndPoints =
    checkIfNoPriceOrPoints("points") && checkIfNoPriceOrPoints("price");

  const handleConfirmDialogOpen = () => {
    setIsConfirmDialogOpen(true);
    if (noPriceAndPoints) {
      setIsGoingToConfirm(true);
    }
  };

  // Render detail view if a reward is selected
  if (id && selectedReward) {
    return (
      <div className="pb-10">
        <div className="fixed inset-0 overflow-y-auto max-width-mobile h-dvh z-[50]">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-5 top-5 z-[60] bg-black/20 hover:bg-black/30 text-white"
            onClick={() => handleSuccessful(-1)}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <ItemCarousel
            images={selectedReward?.product_images}
            image={selectedReward?.product_images?.[0]?.url}
          />
          <section className="p-5 bg-background/70 relative backdrop-blur-sm rounded-t-2xl flex flex-col gap-7 -top-20">
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">Reward</p>
              <h2 className="text-2xl">{selectedReward.name}</h2>
            </div>

            <div className="grid grid-cols-2">
              <div className="flex flex-col gap-1 py-1 pr-7 border-r border-r-[#FFFFFF1A]">
                <p className="text-sm text-muted-foreground">
                  {t("Required Points")}
                </p>
                <h2 className="text-orangefocus text-2xl font-semibold">
                  {getPointsDisplay() || 0}
                </h2>
              </div>
              <div className="flex flex-col gap-1 py-1 pl-7">
                <p className="text-sm text-muted-foreground">
                  {t("Converted to Price")}
                </p>
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">
                    {getPriceDisplay() || 0}{" "}
                  </h2>

                  {/* Product variants have no compare at price, which will set the discount price range */}
                  {getCompareAtPriceDisplay() && (
                    <p className="text-muted-foreground line-through">
                      {getCompareAtPriceDisplay()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="text-base">{t("Description")}</h2>
              <LongParagraph description={selectedReward.description} />
            </div>

            <RewardAccordions />

            {error && (
              <div className="mb-4">
                <div className="bg-red-500/10 text-red-500 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
          </section>

          <footer className="btn-footer flex flex-col gap-7">
            <Sheet open={isSuccessful}>
              <SheetContent
                className="max-width-mobile rounded-lg"
                side="bottom"
              >
                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto pb-6" />
                <h3 className="text-lg font-semibold mb-4 text-center">
                  {t("Reward successfully redeemed")}
                </h3>
                <p className="text-sm text-[#979797] mb-6 text-center">
                  {t(
                    'You can check your redeemed rewards at " Rewards -> My Rewards".'
                  )}
                </p>
                <div className="flex flex-col justify-center items-center gap-4 mt-4">
                  <Button
                    onClick={() => handleSuccessful("/rewards")}
                    className="main-btn w-full"
                  >
                    {t("Confirm")}
                  </Button>
                  <p
                    className="text-muted-foreground"
                    onClick={() => handleSuccessful("/my-rewards")}
                  >
                    See my rewards
                  </p>
                </div>
              </SheetContent>
            </Sheet>

            <Sheet
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
                onClick={handleConfirmDialogOpen}
                className="main-btn !bg-mainbutton rounded-full flex gap-2 items-center justify-center"
              >
                <Gift />
                {isProcessing ? t("Processing...") : t("Redeem Reward")}
              </Button>
              <SheetContent
                className="h-max border-0 outline-none bg-background rounded-t-2xl p-5 flex flex-col"
                side="bottom"
              >
                <section className="flex flex-col gap-7">
                  <div className="mt-1">
                    <h3 className="text-lg font-semibold mb-4">
                      {t("Confirm Redemption?")}
                    </h3>
                    {!isGoingToConfirm && (
                      <p className="text-sm text-[#979797] mb-6">
                        {t(
                          "This item can be redeemed by money. How would you like to exchange the item?"
                        )}
                      </p>
                    )}
                  </div>

                  {isGoingToConfirm ? (
                    <div>
                      Confirm the redemption of "{selectedReward.name}" for{" "}
                      {selectedOption === "price"
                        ? `฿${selectedReward?.product_variants?.[0]?.price}`
                        : noPriceAndPoints
                        ? "free"
                        : `${
                            selectedReward?.product_variants?.[0]
                              ?.points_based_price
                          } point${
                            selectedReward?.product_variants?.[0]
                              ?.points_based_price === 1
                              ? ""
                              : "s"
                          }`}
                      . If it has been redeemed, it cannot be refunded or
                      returned.
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <h3 className="text-lg font-semibold text-center">
                        {t("Choose an option to redeem")}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {redeemOptions.map((option) => {
                          return (
                            <Button
                              key={option.name}
                              className={cn(
                                "w-full text-left rounded-lg transition-all !bg-darkgray h-16",
                                option.selected ? "!bg-mainbutton" : ""
                              )}
                              onClick={() => setSelectedOption(option.name)}
                              disabled={option.disabled}
                            >
                              <div className="flex flex-col items-center">
                                <div
                                  className={cn(
                                    "text-sm font-medium flex items-center gap-1",
                                    {
                                      "text-muted-foreground": !option.selected,
                                    }
                                  )}
                                >
                                  {option.icon}
                                  {option.value}
                                </div>
                                <div
                                  className={cn("text-2xl", {
                                    "text-foreground": !option.selected,
                                  })}
                                >
                                  {option.amount
                                    ? option.amount.toLocaleString()
                                    : t("free")}
                                </div>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                      <p className="font-medium">
                        Available:{" "}
                        <span className="text-orangefocus">
                          {customer?.loyalty_points?.toLocaleString() || 0}
                        </span>
                      </p>
                    </div>
                  )}
                </section>
                <div className="flex items-center gap-2 w-full">
                  {isGoingToConfirm && (
                    <Button
                      onClick={() =>
                        noPriceAndPoints
                          ? setIsConfirmDialogOpen(false)
                          : setIsGoingToConfirm(false)
                      }
                      className="secondary-btn w-full text-foreground"
                    >
                      {t("Cancel")}
                    </Button>
                  )}
                  <Button
                    disabled={isProcessing || selectedOption === ""}
                    onClick={handleConfirmRedeem}
                    className="main-btn w-full"
                  >
                    {isProcessing ? t("Processing...") : t("Confirm")}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

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
                      <TabsTrigger
                        value="coupon-code"
                        className={tabsClassName}
                      >
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

        {/* There are no variant options of the rewards, only product variants. I want the variant options to be fetched similarly to the products' one. */}
        {/* {selectedReward?.variant_options &&
          selectedReward?.variant_options.length > 0 &&
          isRedeemSheetOpen && (
            <VariantDrawer
              open={isRedeemSheetOpen}
              onClose={() => setIsRedeemSheetOpen(false)}
              onSelect={() => {}}
              variants={product_variants || []}
              variantOptions={selectedReward?.variant_options}
              selectedVariantId={id}
              track_quantity={selectedReward?.track_quantity}
              onSubmit={() => setIsConfirmDialogOpen(true)}
            />
          )} */}
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
              {t("Good Afterwork")}
            </h3>
            <h3 className="font-semibold text-xl">
              {hasPoints
                ? `${customerData.loyalty_points.toLocaleString()} ${
                    customerData.loyalty_points === 1 ? "point" : "points"
                  }`
                : "0 points"}
            </h3>
          </div>
          <div className="absolute right-[30px] bottom-5 flex items-center w-fit text-2xl gap-2 text-mainbutton font-semibold">
            <GoodAfterWorkCard />
          </div>
          <button
            onClick={() => navigate("/scan")}
            className="absolute left-[30px] bottom-5"
          >
            <QrCode className="h-6 w-6" />
          </button>
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={() => navigate("/my-rewards")}
            className="w-full bg-darkgray rounded-lg p-4 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="w-12 h-12 rounded-lg bg-[#E66C9E1A] flex items-center justify-center">
                <Gift className="h-5 w-5 text-[#E66C9E]" />
              </div>
              <div className="text-left text-sm">{t("My Rewards")}</div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="px-5 pb-7">
          <h3 className="text-xl font-semibold mb-4">{t("Rewards")}</h3>
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
                        "bg-black flex items-center justify-center":
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
            <NoItemsComp
              icon={Gift}
              text="No rewards available at the moment"
            />
          )}
        </div>
      </section>
    </>
  );
};

export default RewardsPage;
