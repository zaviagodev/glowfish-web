import Header from "@/components/main/Header"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import cardReward from "@/img/my-card.svg"
import EventSection from "@/components/main/EventSection"
import { myRewardsList } from "@/data/data"

const Rewards = () => {

  const [username, setUsername] = useState("Paramita")

  return (
    <>
      <Header title="Your card" rightButton="Detail"/>
      <section>
        <div className="flex items-center justify-between px-5">
          <h1 className="font-semibold text-[28px] m-0">Hello, <span className="text-mainorange">{username}</span></h1>
          <Avatar className="h-[50px] w-[50px]">
            <AvatarImage src="https://github.com/shadcn.png"/>
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
        
        <div className="member-card">
          <img src={cardReward} className="absolute z-0 w-full h-full object-cover"/>

          <div className="flex justify-between items-center p-5 z-5 font-semibold text-xl relative">
            <h3>Glowfish reward.</h3>
            <h3>฿226.78</h3>
          </div>
        </div>

        <EventSection 
          eventCardLink="/rewards/detail/"
          list={myRewardsList}
          cardType="small"
          title="Rewards"
        />
      </section>
    </>
  )
}

export default Rewards