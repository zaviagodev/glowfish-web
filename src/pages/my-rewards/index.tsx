import EventCard from "@/components/main/EventCard"
import Header from "@/components/main/Header"
import { useTranslate } from "@refinedev/core"

const MyRewards = () => {

  const t = useTranslate();

  return (
    <>
      <Header title={t("My Rewards")}/>
    </>
  )
}

export default MyRewards