import Header from "@/components/main/Header"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import cardReward from "@/img/my-card.svg"
import EventSection from "@/components/main/EventSection"
import { useTranslate } from "@refinedev/core"
import { getUserProfile } from "@/lib/auth"
import { useProducts } from "@/hooks/useProducts";
import { useCustomer } from "@/hooks/useCustomer";

const Rewards = () => {
  const t = useTranslate();
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { customer, loading: customerLoading, error: customerError } = useCustomer();
  const [userProfile, setUserProfile] = useState<{
    id: string;
    full_name: string;
    avatar_url: string;
  } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getUserProfile();
      if (profile) {
        setUserProfile(profile);
      }
    };
    loadProfile();
  }, []);

  // Convert products to event format for EventSection
  const productEvents = products.map(product => ({
    id: product.id,
    image: product.image,
    title: product.name,
    location: product.location,
    date: product.date,
    price: product.price === 0 ? t("free") : `฿${product.price}`,
    points: product.price * 10, // Example points calculation
    desc: product.description
  }));

  if (customerLoading || productsLoading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (customerError || productsError) {
    return <div className="text-center text-red-500 mt-8">
      {customerError || productsError}
    </div>;
  }

  return (
    <>
      <Header title={t("Your card")} rightButton={t("Detail")}/>
      <section>
        <div className="flex items-center justify-between px-5">
          <h1 className="font-semibold text-[28px] m-0">{t("Hello")}, <span className="text-mainorange">{userProfile?.full_name || "User"}</span></h1>
          <Avatar className="h-[50px] w-[50px]">
            <AvatarImage src={userProfile?.avatar_url || "https://github.com/shadcn.png"}/>
            <AvatarFallback>
              {userProfile?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="member-card">
          <img src={cardReward} className="absolute z-0 w-full h-full object-cover"/>
          <div className="flex justify-between items-center p-5 z-5 font-semibold text-xl relative">
            <h3>{t("Glowfish reward.")}</h3>
            <h3>{customer?.loyalty_points || 0} {t("points")}</h3>
          </div>
        </div>
        <EventSection 
          eventCardLink="/rewards/detail/"
          list={productEvents}
          cardType="small"
          title={t("Available Products")}
        />
      </section>
    </>
  )
}

export default Rewards