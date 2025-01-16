import GlowfishIcon from "@/components/icons/GlowfishIcon";
import { Filter, Notification, Search } from "@/components/icons/MainIcons";
import Header from "@/components/main/Header";
import { useTranslate } from "@refinedev/core";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import EventSection from "@/components/main/EventSection";
import { event_you_might_enjoy } from "@/data/data";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useProducts } from '@/hooks/useProducts';
import { useCustomer } from "@/hooks/useCustomer";



export const HomeList = () => {
  const t = useTranslate();
  const { products, categories, loading, error } = useProducts();
  const { customer } = useCustomer();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState(products);

  // Update filtered products when category changes or products update
  useEffect(() => {
    if (selectedCategory) {
      const filtered = products.filter(product => product.category_id === selectedCategory);
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [selectedCategory, products]);

  // Convert products to event format
  const productEvents = filteredProducts.map(product => {
    const event = {
      id: product.id,
      image: product.image,
      title: product.name,
      start_datetime: product.start_datetime,
      end_datetime: product.end_datetime,
      location: product.location,
      date: product.date,
      price: product.price === 0 ? t("free") : `฿${product.price}`,
      desc: product.description
    };
    return event;
  });

  const categoryColors = {
    'music-concert': '#FF5050',
    'exhibition': '#EE5736',
    'stand-up-show': '#006642'
  };

  if (loading) {
    return (
      <>
        <Header className="border-0" rightButton={<Notification />}/>
        <div className="text-center mt-8">Loading...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header className="border-0" rightButton={<Notification />}/>
        <div className="text-center text-red-500 mt-8">{error}</div>
      </>
    );
  }

  return (
    <>
      <Header className="border-0" rightButton={<Notification />}/>
      <section>
        <div className="flex items-center justify-between px-5">
          <GlowfishIcon />
          <Link to="/rewards">
            <Avatar className="h-[50px] w-[50px]">
              <AvatarImage src={customer?.avatar_url || "https://github.com/shadcn.png"}/>
              <AvatarFallback>
                {customer?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
        <div className="relative flex items-center text-sm mt-4 px-5">
          <Search className="absolute left-8"/>
          <Input className="h-10 pl-10" placeholder={t("Search event..")}/>
          <Filter className="absolute right-8"/>
        </div>
        <section className="flex flex-col gap-10">
          <div className="flex items-center gap-3 mt-4 px-5 overflow-auto">
            <Button 
              onClick={() => setSelectedCategory(null)}
              style={{
                backgroundColor: selectedCategory === null ? '#EC441E' : '#303030',
              }}
              className="hover:bg-[#303030]"
            >
              {t("All")}
            </Button>
            {categories.map(category => (
              <Button 
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  backgroundColor: selectedCategory === category.id 
                    ? '#EC441E' 
                    : (categoryColors[category.slug as keyof typeof categoryColors] || '#303030')
                }}
                className="hover:bg-[#303030]"
              >
                {category.name}
              </Button>
            ))}
          </div>
          <EventSection 
            list={productEvents} 
            title={t("Upcoming Events")}
            isFullWidth={true}
          />
          <EventSection 
            list={event_you_might_enjoy} 
            title={t("Events you might enjoy")} 
            cardType="small"
          />
        </section>
      </section>
    </>
  );
};
