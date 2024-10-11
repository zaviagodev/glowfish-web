import Header from "@/components/main/Header"

interface StarsSectionProps {
    rating: number
    title: string
    activeColor: string
}

const TellUsAboutYourself = () => {

  const StarsSection = ({ rating = 0, title, activeColor } : StarsSectionProps) => {
    return (
      <section>
        <label>{title}</label>
        <span className="flex justify-between items-center text-2xl">
          {Array.from({ length: 10 }, (_, index) => (
            <span key={index} style={{color: index < rating ? activeColor : '#343434'}}>★</span>
          ))}
        </span>
      </section>
    )
  }

  return (
    <>
      <Header navigateBackTo="/phone-verification"/>

      <h2 className="main-heading">Tell us about <span className="text-[#FF2F00]">yourself.</span></h2>
      <StarsSection title="Food & Beverage"/>
    </>
  )
}

export default TellUsAboutYourself