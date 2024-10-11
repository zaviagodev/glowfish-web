import Header from "@/components/main/Header"
import StarsSection from "@/components/main/StarRatingInput"
import { Button } from "@/components/ui/Button"
import { useState } from "react"
import WelcomeDrawer from "./WelcomeDrawer"

const TellUsAboutYourself = () => {

  const [isNext, setIsNext] = useState(false)

  return (
    <>
      <Header navigateBackTo="/phone-verification"/>

      <section className="flex flex-col gap-y-9 mb-24">
        <h2 className="main-heading">Tell us about <span className="text-[#FF2F00]">yourself.</span></h2>
        <section className="flex flex-col gap-8">
          <StarsSection title="Music and Live Show" rating={4} activeColor="#9B6CDE"/>
          <StarsSection title="Art and Creativity" rating={5} activeColor="#F7D767"/>
          <StarsSection title="Wellness and Mindfulness" rating={6} activeColor="#E66C9E"/>
          <StarsSection title="Fun and Games" rating={7} activeColor="#EC441E"/>
          <StarsSection title="Social event and networking" rating={7} activeColor="#016F64"/>
          <StarsSection title="Sports" rating={7} activeColor="#016F64"/>
          <StarsSection title="Family Fun and Kid Activity" rating={7} activeColor="#016F64"/>
          <StarsSection title="Food and Beverages" rating={10} activeColor="#016F64"/>
        </section>
      </section>

      <footer className="btn-footer">
        <Button className="main-btn !bg-[#4EA65B]" onClick={() => setIsNext(true)}>Next</Button>
      </footer>
      
      <WelcomeDrawer isOpen={isNext} setIsOpen={setIsNext}/>
    </>
  )
}

export default TellUsAboutYourself