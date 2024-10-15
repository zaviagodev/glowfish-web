import Header from "@/components/main/Header"
import StarsSection from "@/components/main/StarRatingInput"
import { Button } from "@/components/ui/Button"
import { useState } from "react"
import WelcomeDrawer from "./WelcomeDrawer"
import RateForm from "./rateForm"

const TellUsAboutYourself = () => {

  const [isNext, setIsNext] = useState(false)

  return (
    <>
      <Header navigateBackTo="/phone-verification"/>

      <section className="flex flex-col gap-y-9 mb-24">
        <h2 className="main-heading">Rate what you are <span className="text-[#FF2F00]">into</span></h2>
        
        <RateForm />
      </section>

      <footer className="btn-footer">
        <Button className="main-btn !bg-[#4EA65B]" onClick={() => setIsNext(true)}>Next</Button>
      </footer>
      
      <WelcomeDrawer isOpen={isNext} setIsOpen={setIsNext}/>
    </>
  )
}

export default TellUsAboutYourself