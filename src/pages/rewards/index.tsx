import Header from "@/components/main/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import cardReward from "@/img/my-card.svg";
import EventSection from "@/components/main/EventSection";
import { useTranslate } from "@refinedev/core";
import { useCustomer } from "@/hooks/useCustomer";
import { useRewards } from "@/hooks/useRewards";
import type { Customer } from "@/services/customerService";

const Rewards = () => {
  const t = useTranslate();
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

  // Convert rewards to event format for EventSection
  const rewardEvents = rewards.map((reward) => ({
    id: parseInt(reward.id), // Convert string ID to number for EventDataProps
    image: reward.image,
    title: reward.name,
    location: reward.location,
    date: reward.date,
    price: reward.price,
    points: reward.price * 10, // Example points calculation
    desc: reward.description,
  }));

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

  // Since customer is a single object from the API, we can use it directly
  const customerData = customer as unknown as Customer; // Type assertion since we know it's a single customer
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
        <EventSection
          eventCardLink="/rewards/detail/"
          list={rewardEvents}
          cardType="small"
          title={t("Available Rewards")}
        />
      </section>
    </>
  );
};

export default Rewards;
