import StarsSection from "@/components/main/StarRatingInput";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "@refinedev/react-hook-form";
import { rateSchema } from "../schemas/rateSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslate } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

type RatingProps = {
  title: string;
  key: string;
  activeColor: string;
};

type RateFormProps = {
  onSubmit: (val: any) => void;
};

export const RateForm = ({ onSubmit }: RateFormProps) => {
  const t = useTranslate();
  const navigate = useNavigate();
  const ratings: RatingProps[] = [
    { title: t("Music and Live Show"), key: "music", activeColor: "#DE473C" },
    { title: t("Art and Creativity"), key: "art", activeColor: "#F5853B" },
    {
      title: t("Wellness and Mindfulness"),
      key: "wellness",
      activeColor: "#FADB28",
    },
    { title: t("Fun and Games"), key: "fun", activeColor: "#14A852" },
    {
      title: t("Social Event and Networking"),
      key: "social",
      activeColor: "#317ABF",
    },
    { title: t("Sports"), key: "sport", activeColor: "#DE473C" },
    {
      title: t("Family Fun and Kid Activity"),
      key: "family",
      activeColor: "#F5853B",
    },
    { title: t("Food and Beverage"), key: "food", activeColor: "#FADB28" },
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // First get existing meta data
      const { data: customerData } = await supabase
        .from("customers")
        .select("meta")
        .eq("auth_id", user.id)
        .single();

      // Merge existing meta with new interests
      const updatedMeta = {
        ...customerData?.meta,
        interests: data,
      };

      // Update customer meta data
      const { error } = await supabase
        .from("customers")
        .update({
          meta: updatedMeta,
        })
        .eq("auth_id", user.id);

      if (error) throw error;

      // Call the original onSubmit
      onSubmit(data);
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <section className="flex flex-col gap-8">
          {ratings.map((rating) => (
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
          <Button className="main-btn w-full" type="submit">
            {t("Next")}
          </Button>
        </footer>
      </form>
    </Form>
  );
}; 