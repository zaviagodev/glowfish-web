import Header from "@/components/main/Header"
import { useNavigate } from "react-router-dom";
import EventCard from "@/components/main/EventCard";
import { useTranslate } from "@refinedev/core";
import { myRewardsList } from "@/data/data";

const MyRewards = () => {
  const t = useTranslate();
  const navigate = useNavigate();

  return (
    <>
      <Header title={t("My Rewards")}/>
      <section className="flex flex-col gap-y-10">
        <h2 className="page-title">{t("My rewards")} ({myRewardsList.length})</h2>
        <section className="flex flex-col gap-y-5">
          {myRewardsList.map(reward => (
            <EventCard 
              type="event"
              title={reward.title}
              image={reward.image}
              validDate={reward.validDate}
              onClick={() => navigate(`/rewards/detail/${reward.id}`)}
            />
          ))}
        </section>
      </section>
    </>
  )
}

export default MyRewards