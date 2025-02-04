import { useState, useRef, useEffect } from "react";
import { useTranslate } from "@refinedev/core";
import { ChevronLeft, ChevronRight, SearchIcon } from "lucide-react";
import Header from "@/components/main/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { getUserProfile } from "@/lib/auth";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/lib/supabase";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { ProductDetail } from "@/components/product/ProductDetail";
import { motion } from "framer-motion";
import GlowfishIcon from "@/components/icons/GlowfishIcon";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { SearchDialog } from "@/components/home/SearchDialog";
import { ProductSection } from "@/components/home/ProductSection";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export const HomeList = () => {
  const t = useTranslate();
  const navigate = useNavigate();
  const { products, loading, error } = useProducts();
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [userProfile, setUserProfile] = useState<{
    id: string;
    full_name: string;
    avatar_url: string;
  } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const productSliderRef = useRef<HTMLDivElement>(null);

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category_id === selectedCategory)
    : products;

  const searchResults = filteredProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductSelect = (product: any) => {
    // If product has no variants, just set the product
    if (!product.product_variants || product.product_variants.length === 0) {
      setSelectedProduct({
        ...product,
        track_quantity: product.track_quantity,
        variant_id: undefined,
        quantity: product.quantity,
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
        quantity: variant.quantity,
      });
      setIsSearchOpen(false);
      return;
    }

    // If product has multiple variants, don't select any by default
    setSelectedProduct({
      ...product,
      track_quantity: product.track_quantity,
      variant_id: undefined,
      quantity: product.quantity,
    });
    setIsSearchOpen(false);
  };

  const getPriceDisplay = (product: any) => {
    if (!product.product_variants || product.product_variants.length === 0) {
      return product.price === 0
        ? t("free")
        : `${product.price.toLocaleString()}`;
    }

    if (product.product_variants.length === 1) {
      return `${product.product_variants[0].price.toLocaleString()}`;
    }

    const prices = product.product_variants.map((v: any) => v.price);
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
        setUserProfile(profile);
      }
    };
    loadProfile();

    // Fetch categories
    const fetchCategories = async () => {
      setLoadingCategories(true);
      const { data, error } = await supabase
        .from("product_categories")
        .select("*")
        .order("name");

      if (data) {
        setCategories(data);
      }
      setLoadingCategories(false);
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    navigate("/products", { state: { selectedCategory: categoryId } });
  };

  return (
    <div className="min-h-full relative">
      {/* Hero Section */}
      <div className="relative">
        <section
          className={cn(
            "relative w-full overflow-hidden"
            // "bg-gradient-to-br from-primary/5 via-primary/10 to-transparent",
            // "pb-[25px]"
          )}
        >
          {/* Background Pattern */}
          <div
            className={cn(
              "absolute inset-0 opacity-[0.15]",
              "bg-[radial-gradient(circle_at_1px_1px,var(--primary)_1px,transparent_0)]",
              "bg-[size:24px_24px]",
              "[mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]"
            )}
          />

          {/* Content Container */}
          <div className="relative pt-6">
            <div className="flex items-center justify-between">
              <div className="px-5">
                {/* TODO: add GlowfishIcon */}
                <GlowfishIcon className="w-[80px] h-[40px]" />
              </div>
              <Link to="/settings">
                <div className="px-5">
                  <Avatar className="h-[50px] w-[50px] border-2 border-border">
                    <AvatarImage
                      src={
                        userProfile?.avatar_url ||
                        "https://github.com/shadcn.png"
                      }
                    />
                    <AvatarFallback>
                      {userProfile?.full_name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </Link>
            </div>

            {/* <div className="relative flex items-center text-sm mt-6 px-5">
              <div className="relative w-full shadow-lg">
                <Input
                  className="h-10 pl-10 bg-darkgray text-foreground border border-input rounded-full"
                  placeholder={t("Search events...")}
                  onClick={() => setIsSearchOpen(true)}
                  readOnly
                />
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              </div>
            </div> */}
          </div>
        </section>
      </div>

      {/* Search Dialog */}
      <SearchDialog
        isOpen={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={searchResults}
        onProductSelect={handleProductSelect}
      />

      {/* Category Bar */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <CategoryGrid
          categories={categories}
          isLoading={loadingCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      <section className="py-6 space-y-6">
        <ProductSection
          title={t("Featured Products")}
          linkTo="/products"
          products={products}
          onProductSelect={handleProductSelect}
          sliderRef={productSliderRef}
        />

        {/* Events you might enjoy Section */}
        <div className="space-y-4 px-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">
              {t("Events you might enjoy")}
            </h2>
            <Link
              to="/products"
              className="text-sm text-muted-foreground hover:text-foreground no-underline"
            >
              {t("See all")}
            </Link>
          </div>

          <div
            className={cn(
              "flex gap-3 overflow-x-auto scrollbar-hide pb-4 -mx-5 px-5",
              "scroll-smooth"
            )}
          >
            {products.slice(0, 4).map((product) => (
              <motion.div
                key={product.name}
                className="flex-shrink-0 w-[280px]"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => handleProductSelect(product)}
              >
                <AnimatedCard
                  id={product.id}
                  image={product.image}
                  title={product.name}
                  price={product.price}
                  compareAtPrice={product.compare_at_price}
                  description={product.description}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Detail */}
      {selectedProduct && (
        <ProductDetail
          {...selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};
