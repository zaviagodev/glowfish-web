import Header from "@/components/main/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import cardReward from "@/img/my-card.svg";
import { useTranslate } from "@refinedev/core";
import { useCustomer } from "@/hooks/useCustomer";
import { useRewards } from "@/hooks/useRewards";
import type { Customer } from "@/services/customerService";
import { useNavigate } from "react-router-dom";
import { Calendar, Gift, MapPin, Package2, Tag } from "lucide-react";
import GlowfishIcon from "@/components/icons/GlowfishIcon";
import { cn } from "@/lib/utils";

const Rewards = () => {
  const t = useTranslate();
  const navigate = useNavigate();
  const {
    rewards,
    loading: rewardsLoading,
    error: rewardsError,
  } = useRewards();
  const {
    customer,
    loading: customerLoading,
    error: customerError,
  } = useCustomer();

  // The link below is going to be used as the empty state image on the settings page
  // const imageUrl =
  //   'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f5f5f5"/%3E%3C/svg%3E';
  const rewardEvents = rewards.map((reward) => {
    return {
      id: reward.id,
      image: reward?.product_images?.[0]?.url || "",
      title: reward.name,
      description: reward.description,
      location: reward.location,
      date: reward.date,
      price: reward.product_variants?.[0]?.price,
      points: reward.product_variants?.[0]?.points_based_price,
      desc: reward.description,
    };
  });

  if (customerLoading || rewardsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (customerError || rewardsError) {
    return (
      <div className="text-center text-red-500 mt-8">
        {customerError || rewardsError}
      </div>
    );
  }

  const customerData = customer as unknown as Customer;
  const fullName = customerData
    ? `${customerData.first_name} ${customerData.last_name}`.trim()
    : "User";

  const hasPoints =
    customerData?.loyalty_points && customerData.loyalty_points > 0;
  const hasRewards = rewardEvents && rewardEvents.length > 0;

  return (
    <>
      <Header title={t("Your card")} />
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
          <img
            src={cardReward}
            className="absolute z-0 w-full h-full object-cover opacity-75"
          />
          <div className="flex justify-between items-center p-5 z-5 relative">
            <h3 className="font-semibold text-2xl tracking-[-0.4px]">
              {t("Good After Work")}
            </h3>
            <h3 className="font-semibold text-2xl">
              {hasPoints
                ? t("point", { count: customerData.loyalty_points })
                : "0 points"}
            </h3>
          </div>
          <div className="absolute z-[99] right-5 bottom-2 flex items-center w-fit text-2xl gap-2 text-mainbutton font-semibold">
            <GlowfishIcon className="w-[72px]" />| Glowfish
          </div>
        </div>

        <div className="px-5 pb-7">
          <h3 className="page-title mb-4">{t("Rewards")}</h3>
          {hasRewards ? (
            <div className="grid grid-cols-2 gap-4">
              {rewardEvents.map((reward) => (
                <div
                  key={reward.id}
                  onClick={() => navigate(`/rewards/detail/${reward.id}`)}
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
                    {/* <div className="absolute top-2 left-2 px-3 py-1.5 rounded-full bg-orangefocus text-white text-xs font-medium">
                      {reward.price && reward.price !== 0
                        ? `฿${reward.price}`
                        : "Free"}
                    </div> */}
                  </div>

                  <div className="p-4 space-y-2 bg-card">
                    <div>
                      <h3 className="font-semibold text-foreground line-clamp-1">
                        {reward.title}
                      </h3>
                      {/* <p className="text-sm text-muted-foreground line-clamp-1">
                        {reward.description}
                      </p> */}
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
                          ? t("point", { count: reward.points })
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

export default Rewards;
