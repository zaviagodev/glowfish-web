import Header from "@/components/main/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import cardReward from "@/img/my-card.svg";
import { useTranslate } from "@refinedev/core";
import { useCustomer } from "@/hooks/useCustomer";
import { useRewards } from "@/hooks/useRewards";
import type { Customer } from "@/services/customerService";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Tag } from "lucide-react";

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

  const imageUrl =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f5f5f5"/%3E%3C/svg%3E';
  const rewardEvents = rewards.map((reward) => {
    return {
      id: reward.id,
      image: reward?.product_images?.[0]?.url || imageUrl,
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
      <Header title={t("Your card")} rightButton={t("Detail")} />
      <section>
        <div className="flex items-center justify-between px-5">
          <h1 className="font-semibold text-[28px] m-0">
            {t("Hello")}, <span className="text-mainorange">{fullName}</span>
          </h1>
          <Avatar className="h-[50px] w-[50px]">
            <AvatarImage
              src={
                customerData?.meta?.avatar_url ||
                "https://github.com/shadcn.png"
              }
            />
            <AvatarFallback>
              {fullName?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="member-card h-[60px]">
          <img
            src={cardReward}
            className="absolute z-0 w-full h-full object-cover"
          />
          <div className="flex justify-between items-center p-5 z-5 font-semibold text-xl relative">
            <h3>{t("Glowfish reward.")}</h3>
            <h3>
              {hasPoints ? (
                t("point", { count: customerData.loyalty_points })
              ) : (
                <span className="text-sm font-normal">
                  {t("No points yet")}
                </span>
              )}
            </h3>
          </div>
        </div>

        <div className="px-5 pb-7">
          <h3 className="page-title mb-4">{t("Available Rewards")}</h3>
          {hasRewards ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewardEvents.map((reward) => (
                <div
                  key={reward.id}
                  onClick={() => navigate(`/rewards/detail/${reward.id}`)}
                  className="relative overflow-hidden rounded-lg cursor-pointer w-full bg-card h-full border border-input transition-all duration-200 hover:scale-[0.98] active:scale-[0.97] text-sm"
                >
                  <div className="relative overflow-hidden h-[50vw] w-full">
                    <img
                      src={reward.image}
                      alt={reward.title}
                      className="w-full h-full object-cover object-top"
                    />
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
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {reward.description}
                      </p>
                    </div>
                    <div className="flex items-baseline gap-2 text-lg font-semibold">
                      {/* <Tag className="w-3.5 h-3.5" /> */}
                      <span>
                        {reward.points
                          ? t("point", { count: reward.points })
                          : t("Free")}
                      </span>
                    </div>
                    {reward.location && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="line-clamp-1">{reward.location}</span>
                      </div>
                    )}
                    {reward.date && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{reward.date}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
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
