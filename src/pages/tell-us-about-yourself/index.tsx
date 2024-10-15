import Header from "@/components/main/Header"
import { useState } from "react"
import WelcomeDrawer from "./WelcomeDrawer"
import RateForm from "./rateForm"
import { useTranslate } from "@refinedev/core"

const TellUsAboutYourself = () => {

  const t = useTranslate();
  const [isNext, setIsNext] = useState(false);

  return (
    <>
      <Header />
      <section className="flex flex-col gap-y-9 mb-24">
        <h2 className="main-heading">{t("Rate what you are")} <span className="text-[#FF2F00]">{t("into")}</span></h2>
        <RateForm onSubmit={setIsNext}/>
      </section>
      <WelcomeDrawer isOpen={isNext} setIsOpen={setIsNext}/>
    </>
  )
}

export default TellUsAboutYourself