import { useState, useRef, useEffect } from "react";
import { useTranslate } from "@refinedev/core";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { getUserProfile } from "@/lib/auth";
import { useProducts } from "@/features/home/hooks/useProducts";
import { cn, formattedDateAndTime } from "@/lib/utils";
import { ProductDetail } from "@/features/home/components/ProductDetail";
import { CategoryGrid } from "@/features/home/components/CategoryGrid";
import { SearchDialog } from "@/features/home/components/SearchDialog";
import { ProductSection } from "@/features/home/components/ProductSection";
import { format, toZonedTime } from "date-fns-tz";
import { isPast } from "date-fns";
import { Category, Product } from "@/features/home/types/product.types";
import { Banner } from "@/features/home";
import { useConfig } from "@/hooks/useConfig";
import DefaultStorefront from "@/components/icons/DefaultStorefront";
import HomeSkeletons from "@/components/skeletons/HomeSkeletons";

interface SelectedProduct extends Product {
  variant_id?: string;
  quantity?: number;
}

export const HomeList = () => {
  const t = useTranslate();
  const navigate = useNavigate();
  const { products, events, loading, error, categories } = useProducts();
  const { config } = useConfig();
  const [userProfile, setUserProfile] = useState<{
    id: string;
    full_name: string;
    avatar_url: string;
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<SelectedProduct | null>(null);
  const productSliderRef = useRef<HTMLDivElement>(null);
  const eventSliderRef = useRef<HTMLDivElement>(null);

  const filteredProducts = selectedCategory
    ? events.filter(
        (product: Product) => product.category_id === selectedCategory
      )
    : events;

  const searchResults = filteredProducts.filter(
    (product: Product) =>
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
        quantity: product.product_variants?.[0]?.quantity || 0,
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
      quantity: product.product_variants?.[0]?.quantity || 0,
    });
    setIsSearchOpen(false);
  };

  const getPriceDisplay = (product: Product) => {
    if (!product.product_variants || product.product_variants.length === 0) {
      return product.price === 0
        ? t("free")
        : `${product.price.toLocaleString()}`;
    }

    if (product.product_variants.length === 1) {
      return `${product.product_variants[0].price.toLocaleString()}`;
    }

    const prices = product.product_variants.map((v) => v.price);
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
      "dd MMM yyyy HH:mm"
    )} - ${format(
      toZonedTime(new Date(selectedProduct.end_datetime), "UTC"),
      "dd MMM yyyy HH:mm"
    )}`;

  if (loading) {
    return <HomeSkeletons />;
  }

  const upcomingEvents = events
    .filter(
      (product: Product) =>
        product.end_datetime && isPast(new Date(product.end_datetime)) === false
    )
    .sort((a, b) => {
      const dateA = new Date(a.start_datetime || "");
      const dateB = new Date(b.start_datetime || "");
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5);

  const eventsYouMightEnjoy = events
    .sort((a, b) => {
      const dateA = new Date(a.updated_at || "");
      const dateB = new Date(b.updated_at || "");
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 8);

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
                {config?.storeLogo ? (
                  <img
                    src={config.storeLogo}
                    alt="Store Logo"
                    className="max-h-[68px] object-contain"
                  />
                ) : (
                  <DefaultStorefront />
                )}
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

      <section className="space-y-6 px-[1px]">
        <div className="sticky top-0 bg-background border-b">
          <CategoryGrid
            categories={categories}
            isLoading={loading}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            tab_type="colorful"
          />
        </div>
        <ProductSection
          title={t("Upcoming Events")}
          linkTo="/events"
          products={upcomingEvents}
          onProductSelect={handleProductSelect}
          sliderRef={productSliderRef}
          isLoading={loading}
          isProduct={false}
        />

        {/* Events you might enjoy Section */}
        <ProductSection
          title={t("Events you might enjoy")}
          linkTo="/events"
          products={eventsYouMightEnjoy}
          onProductSelect={handleProductSelect}
          sliderRef={eventSliderRef}
          isLoading={loading}
          isProduct={false}
          type="small"
        />
      </section>

      {/* Category Bar */}
      {/* <div className="sticky top-0 bg-background border-b">
        <CategoryGrid
          categories={categories}
          isLoading={loading}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          tab_type="no_style"
        />
      </div> */}

      {/* <section className="py-6 space-y-6 px-[1px]"> */}
        {/* <ProductSection
          title={t("Discover things you'd love")}
          linkTo=""
          products={products.slice(0, 5)}
          onProductSelect={() => {}}
          sliderRef={eventSliderRef}
          isLoading={loading}
          isBanner={true}
        /> */}
        {/* New Arrivals Section */}
        {/* <ProductSection
          title={t("New Arrivals")}
          linkTo="/products"
          products={products.slice(0, 8)}
          onProductSelect={handleProductSelect}
          sliderRef={eventSliderRef}
          isLoading={loading}
          isProduct={true}
        />
      </section> */}

      {/* Product Detail */}
      {selectedProduct && (
        <ProductDetail
          {...selectedProduct}
          location={selectedProduct.location}
          date={formattedDate}
          onClose={() => setSelectedProduct(null)}
          isEvent={!!selectedProduct.end_datetime}
        />
      )}
    </div>
  );
};
