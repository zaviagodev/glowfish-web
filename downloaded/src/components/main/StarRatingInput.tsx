import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

interface StarsSectionProps {
  value: number
  title: string
  activeColor: string
  onChange: (value: number) => void
}

const StarsSection = ({ value = 0, title, activeColor, onChange } : StarsSectionProps) => {
  return (
    <section>
      <FormLabel className="text-[#CFCFCF] text-base font-sfpro-rounded font-semibold">{title}</FormLabel>
      <span className="flex justify-between items-center text-2xl">
        {Array.from({ length: 10 }, (_, index) => (
          <span key={index} style={{color: index < value ? activeColor : '#343434'}} onClick={() => onChange(index + 1)}>★</span>
        ))}
      </span>
    </section>
  )
}

export default StarsSection