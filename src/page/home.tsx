import { useState, useRef, useEffect } from "react";
import { useTranslate } from "@refinedev/core";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { getUserProfile } from "@/lib/auth";
import { useProducts } from "@/features/home/hooks/useProducts";
import { cn } from "@/lib/utils";
import { ProductDetail } from "@/components/product/ProductDetail";
import GlowfishIcon from "@/components/icons/GlowfishIcon";
import { CategoryGrid } from "@/features/home/components/CategoryGrid";
import { SearchDialog } from "@/features/home/components/SearchDialog";
import { ProductSection } from "@/features/home/components/ProductSection";
import { format, toZonedTime } from "date-fns-tz";
import { Category } from "@/features/home/types/product.types";

export const HomeList = () => {
  const t = useTranslate();
  const navigate = useNavigate();
  const { products, loading, error, categories } = useProducts();
  const [userProfile, setUserProfile] = useState<{
    id: string;
    full_name: string;
    avatar_url: string;
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const productSliderRef = useRef<HTMLDivElement>(null);
  const eventSliderRef = useRef<HTMLDivElement>(null);

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
        setUserProfile({
          id: profile.id,
          full_name: profile.full_name || "",
          avatar_url: profile.avatar_url || "",
        });
      }
    };
    loadProfile();
  }, []);

  const handleCategoryClick = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    navigate("/products", { state: { selectedCategory: categoryId } });
  };

  const formattedDate =
    selectedProduct?.start_datetime &&
    selectedProduct?.end_datetime &&
    `${format(
      toZonedTime(new Date(selectedProduct.start_datetime), "UTC"),
      "dd/MM/yyyy, hh:mm a"
    )} - ${format(
      toZonedTime(new Date(selectedProduct.end_datetime), "UTC"),
      "dd/MM/yyyy, hh:mm a"
    )}`;

  return (
    <div className="min-h-screen relative">
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
                <GlowfishIcon className="w-[90px]" />
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
          isLoading={loading}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      <section className="py-6 space-y-6 px-[1px]">
        <ProductSection
          title={t("Upcoming Events")}
          linkTo="/products"
          products={products}
          onProductSelect={handleProductSelect}
          sliderRef={productSliderRef}
          isLoading={loading}
        />

        {/* Events you might enjoy Section */}
        <ProductSection
          title={t("Events you might enjoy")}
          linkTo="/products"
          products={products.slice(0, 4)}
          onProductSelect={handleProductSelect}
          sliderRef={eventSliderRef}
          isLoading={loading}
        />
      </section>

      {/* Product Detail */}
      {selectedProduct && (
        <ProductDetail
          {...selectedProduct}
          location={selectedProduct.location}
          date={formattedDate}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};
