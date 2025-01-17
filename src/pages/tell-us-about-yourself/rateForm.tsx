import StarsSection from "@/components/main/StarRatingInput"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "@refinedev/react-hook-form"
import { rateSchema } from "./rateSchema"
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslate } from "@refinedev/core"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useNavigate } from "react-router-dom"

type RatingProps = {
  title: string
  key: string
  activeColor: string
}

type RateFormProps = {
  onSubmit: (val: any) => void
}

const RateForm = ({
  onSubmit
}: RateFormProps) => {
  const t = useTranslate();
  const navigate = useNavigate();
  const ratings: RatingProps[] = [
    { title: t("Music and Live Show"), key: "music", activeColor: "#9B6CDE" },
    { title: t("Art and Creativity"), key: "art", activeColor: "#F7D767" },
    { title: t("Wellness and Mindfulness"), key: "wellness", activeColor: "#E66C9E" },
    { title: t("Fun and Games"), key: "fun", activeColor: "#EC441E" },
    { title: t("Social event and networking"), key: "social", activeColor: "#016F64" },
    { title: t("Sports"), key: "sport", activeColor: "#016F64" },
    { title: t("Family Fun and Kid Activity"), key: "family", activeColor: "#016F64" },
    { title: t("Food and Beverages"), key: "food", activeColor: "#016F64" }
  ];

  const defaultValues = ratings.reduce((acc, rating) => {
    acc[rating.key] = 0;
    return acc;
  }, {} as any);

  const form = useForm({
    resolver: yupResolver(rateSchema),
    defaultValues: defaultValues,
  });

  const handleSubmit = async (data: any) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update customer meta data
      const { error } = await supabase
        .from('customers')
        .update({
          meta: {
            interests: data
          }
        })
        .eq('id', user.id);

      if (error) throw error;

      // Call the original onSubmit
      onSubmit(data);

    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <section className="flex flex-col gap-8">
          {ratings.map(rating => (
            <FormField
              key={rating.key}
              control={form.control}
              name={rating.key}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <StarsSection 
                      title={rating.title}
                      activeColor={rating.activeColor} 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </section>

        <footer className="btn-footer">
          <Button className="main-btn !bg-[#4EA65B]" type="submit">{t("Next")}</Button>
        </footer>
      </form>
    </Form>
  )
}

export default RateForm