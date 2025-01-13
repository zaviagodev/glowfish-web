import GlowfishIcon from "@/components/icons/GlowfishIcon";
import { Filter, Menu, Notification, Search } from "@/components/icons/MainIcons";
import Header from "@/components/main/Header";
import { useTranslate } from "@refinedev/core";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import EventSection from "@/components/main/EventSection";
import { event_you_might_enjoy } from "@/data/data";
import { Link } from "react-router-dom";
import { getUserProfile } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export const HomeList = () => {
  const t = useTranslate();
  const { products, loading, error } = useProducts();
  const [userProfile, setUserProfile] = useState<{
    id: string;
    full_name: string;
    avatar_url: string;
  } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getUserProfile();
      if (profile) {
        setUserProfile(profile);
      }
    };
    loadProfile();

    // Fetch categories
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');
      
      if (data) {
        setCategories(data);
      }
    };
    fetchCategories();
  }, []);

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

  return (
    <>
      <Header leftButton={<Menu className="text-white"/>} className="border-0" rightButton={<Notification />}/>
      <section>
        <div className="flex items-center justify-between px-5">
          <GlowfishIcon />
          <Link to="/rewards">
            <Avatar className="h-[50px] w-[50px]">
              <AvatarImage src={userProfile?.avatar_url || "https://github.com/shadcn.png"}/>
              <AvatarFallback>
                {userProfile?.full_name?.charAt(0)?.toUpperCase() || "U"}
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
          {loading ? (
            <div className="text-center">Loading events...</div>
          ) : error ? (
            <div className="text-center text-red-500">Error loading events: {error}</div>
          ) : (
            <>
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
            </>
          )}
        </section>
      </section>
    </>
  );
};