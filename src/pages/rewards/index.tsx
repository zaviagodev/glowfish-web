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

  const imageUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f5f5f5"/%3E%3C/svg%3E';
  const rewardEvents = rewards.map((reward) => {
    return {
      id: reward.id,
      image: reward?.product_images?.[0]?.url  || imageUrl,
      title: reward.name,
      location: reward.location,
      date: reward.date,
      price: reward.product_variants?.[0]?.price,
      points: reward.product_variants?.[0]?.points_based_price,
      desc: reward.description,
    };
  });


  if (customerLoading || rewardsLoading) {
    return <div className="text-center mt-8">Loading...</div>;
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
              src={customerData?.meta?.avatar_url || "https://github.com/shadcn.png"}
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
            <h3>{t("point", { count: customerData?.loyalty_points || 0 })}</h3>
          </div>
        </div>

        <div className="px-5 mt-[30px]">
          <h3 className="page-title mb-4">{t("Available Rewards")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewardEvents.map((reward) => (
              <div
                key={reward.id}
                onClick={() => navigate(`/rewards/detail/${reward.id}`)}
                className="relative overflow-hidden rounded-lg cursor-pointer w-full border border-border/10 transition-all duration-200 hover:scale-[0.98] active:scale-[0.97]"
              >
                <div className="relative overflow-hidden h-[220px] w-full">
                  <img
                    src={reward.image}
                    alt={reward.title}
                    className="w-full h-full object-cover rounded-lg object-top"
                  />
                  <div className="absolute top-2 left-2 px-3 py-1.5 rounded-full bg-orangefocus text-white text-xs font-medium">
                    {reward.price && reward.price !== 0 ? `฿${reward.price}` : ''}
                  </div>
                </div>

                <div className="p-2 space-y-4 flex-1 text-white absolute bottom-0 w-full">
                  <div className="space-y-2 backdrop-blur-sm rounded-lg bg-background/50 p-4">
                    <h3 className="font-semibold line-clamp-2 text-sm">{reward.title}</h3>
                    {reward.location && (
                      <div className="flex items-center gap-2 text-xs">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="line-clamp-1">{reward.location}</span>
                      </div>
                    )}
                    {reward.date && (
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{reward.date}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs">
                      <Tag className="w-3.5 h-3.5" />
                      <span>
                        {reward.points ? t("point", { count: reward.points }) : t("Free")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Rewards;
