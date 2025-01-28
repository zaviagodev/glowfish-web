import { useState, useRef, useEffect } from "react";
import { useTranslate } from "@refinedev/core";
import { Filter, Notification, Search } from "@/components/icons/MainIcons";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GlowfishIcon from "@/components/icons/GlowfishIcon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { getUserProfile } from "@/lib/auth";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/lib/supabase";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { ProductDetail } from "@/components/product/ProductDetail"; 

import { Header } from "@/components/home/Header";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { SearchDialog } from "@/components/home/SearchDialog";
import { ProductSection } from "@/components/home/ProductSection";

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface ProductVariant {
  id: string;
  price: number;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  category_id: string;
  track_quantity: boolean;
  quantity?: number;
  product_variants?: ProductVariant[];
  regular_price?: number;
}

export const HomeList = () => {
  const t = useTranslate();
  const { products, categories, loading, error } = useProducts();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const productSliderRef = useRef<HTMLDivElement>(null);

  const filteredProducts = selectedCategory
    ? products.filter(product => product.category_id === selectedCategory)
    : products;

  const searchResults = filteredProducts.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductSelect = (product: Product) => {
    // If product has no variants, just set the product
    if (!product.product_variants || product.product_variants.length === 0) {
      setSelectedProduct({
        ...product,
        track_quantity: product.track_quantity,
        variant_id: undefined,
        quantity: product.quantity
      });
      setIsSearchOpen(false);
      return;
    }

    // If product has only one variant, select it
    if (product.product_variants.length === 1) {
      const variant = product.product_variants[0];
      setSelectedProduct({
        ...product,
        track_quantity: product.track_quantity,
        variant_id: variant.id,
        quantity: variant.quantity
      });
      setIsSearchOpen(false);
      return;
    }

    // If product has multiple variants, don't select any by default
    setSelectedProduct({
      ...product,
      track_quantity: product.track_quantity,
      variant_id: undefined,
      quantity: product.quantity
    });
    setIsSearchOpen(false);
  };

  const getPriceDisplay = (product: Product) => {
    if (!product.product_variants || product.product_variants.length === 0) {
      return product.price === 0 ? t("free") : `${product.price.toLocaleString()}`;
    }

    if (product.product_variants.length === 1) {
      return `${product.product_variants[0].price.toLocaleString()}`;
    }

    const prices = product.product_variants.map(v => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return `${minPrice.toLocaleString()}`;
    }

    return `${minPrice.toLocaleString()} - ฿${maxPrice.toLocaleString()}`;
  };

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getUserProfile();
      if (profile) {
        setUserProfile({
          id: profile.id,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url || null
        });
      }
    };
    loadProfile();
  }, []);

  return (
    <div className="relative">
      <Header onSearchClick={() => setIsSearchOpen(true)} />

      <div className="pt-[87px]">
        <CategoryGrid
          categories={categories}
          isLoading={loading}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <SearchDialog
          isOpen={isSearchOpen}
          onOpenChange={setIsSearchOpen}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchResults={searchResults}
          onProductSelect={handleProductSelect}
        />

        <section className="px-4 py-6 space-y-6">
          <ProductSection
            title={t("Featured Products")}
            linkTo="/products"
            products={products}
            onProductSelect={handleProductSelect}
            sliderRef={productSliderRef}
          />

          {/* Flash Deals Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{t("Flash Deals")}</h2>
                <div className="px-2 py-1 bg-destructive text-white text-xs font-medium rounded-full">
                  24:00:00
                </div>
              </div>
              <Link to="/flash-deals" className="text-sm text-muted-foreground hover:text-foreground">
                {t("See all")}
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {products.slice(0, 4).map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                >
                  <AnimatedCard
                    id={product.id}
                    image={product.image}
                    title={product.name}
                    price={product.price}
                    comparePrice={product.regular_price}
                    type="small"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {selectedProduct && (
          <ProductDetail
            {...selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </div>
    </div>
  );
};