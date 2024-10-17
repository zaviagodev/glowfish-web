import Header from "@/components/main/Header"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import cardReward from "@/img/my-card.svg"
import EventSection from "@/components/main/EventSection"
import { myRewardsList } from "@/data/data"
import { useTranslate } from "@refinedev/core"

type UserProfileProps = {
  username: string
  amount: number
}

const Rewards = () => {
  const t = useTranslate();
  const [userprofile, setUserProfile] = useState<UserProfileProps>({
    username: "Paramita",
    amount: 226.78
  });
  const { username, amount } = userprofile;

  return (
    <>
      <Header title={t("Your card")} rightButton={t("Detail")}/>
      <section>
        <div className="flex items-center justify-between px-5">
          <h1 className="font-semibold text-[28px] m-0">{t("Hello")}, <span className="text-mainorange">{username}</span></h1>
          <Avatar className="h-[50px] w-[50px]">
            <AvatarImage src="https://github.com/shadcn.png"/>
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
        <div className="member-card">
          <img src={cardReward} className="absolute z-0 w-full h-full object-cover"/>
          <div className="flex justify-between items-center p-5 z-5 font-semibold text-xl relative">
            <h3>{t("Glowfish reward.")}</h3>
            <h3>฿{amount}</h3>
          </div>
        </div>
        <EventSection 
          eventCardLink="/rewards/detail/"
          list={myRewardsList}
          cardType="small"
          title={t("Rewards")}
        />
      </section>
    </>
  )
}

export default Rewards