import StarsSection from "@/components/main/StarRatingInput"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "@refinedev/react-hook-form"
import { useState } from "react"

type Rating = {
  title: string
  key: string
  activeColor: string
  rating: number
}

const RateForm = () => {
  const [ratings, setRatings] = useState<Rating[]>([
    { title: "Music and Live Show", key: "music", activeColor: "#9B6CDE", rating: 0 },
    { title: "Art and Creativity", key: "art", activeColor: "#F7D767", rating: 0 },
    { title: "Wellness and Mindfulness", key: "wellness", activeColor: "#E66C9E", rating: 0 },
    { title: "Fun and Games", key: "fun", activeColor: "#EC441E", rating: 0 },
    { title: "Social event and networking", key: "social", activeColor: "#016F64", rating: 0 },
    { title: "Sports", key: "sport", activeColor: "#016F64", rating: 0 },
    { title: "Family Fun and Kid Activity", key: "family", activeColor: "#016F64", rating: 0 },
    { title: "Food and Beverages", key: "food", activeColor: "#016F64", rating: 0 }
  ])

  const defaultValues = ratings.reduce((acc, rating) => {
    acc[rating.key] = 0;
    return acc;
  }, {} as { [key: string]: number });

  const form = useForm({
    defaultValues: defaultValues
  })
  
  const handleRatingChange = (key: string, newRating: number) => {
    setRatings(prevRatings =>
      prevRatings.map(item =>
        item.key === key ? { ...item, rating: newRating } : item
      )
    );
    form.setValue(key, newRating)
  };

  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(data => data)}>
          <section className="flex flex-col gap-8">
            {ratings.map(rating => (
              <FormField
                control={form.control}
                name={rating.key}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <StarsSection 
                        key={rating.key}
                        title={rating.title}
                        rating={rating.rating} 
                        activeColor={rating.activeColor} 
                        onChange={(newRating: number) => {
                          handleRatingChange(rating.key, newRating);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </section>
        </form>
      </Form>
  )
}

export default RateForm