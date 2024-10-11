interface StarsSectionProps {
    rating: number
    title: string
    activeColor: string
    onChange?: () => void
}

const StarsSection = ({ rating = 0, title, activeColor, onChange } : StarsSectionProps) => {

    return (
      <section>
        <label className="text-[#CFCFCF] text-base font-sfpro-rounded font-semibold">{title}</label>
        <span className="flex justify-between items-center text-2xl">
          {Array.from({ length: 10 }, (_, index) => (
            <span key={index} style={{color: index < rating ? activeColor : '#343434'}} onChange={onChange}>★</span>
          ))}
        </span>
      </section>
    )
  }

  export default StarsSection