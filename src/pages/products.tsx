import { useTranslate } from "@refinedev/core";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Filter,
  ArrowUpDown,
  Search,
  Check,
  ShoppingCart,
  Package2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { useProducts } from "@/features/home/hooks/useProducts";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductDetail } from "@/features/home/components/ProductDetail";
import { useLocation, useNavigate } from "react-router-dom";
import { CategoryGrid } from "@/features/home/components/CategoryGrid";
import { Product } from "@/features/home/services/productService";
import { cn, formattedDateAndTime } from "@/lib/utils";
import NoItemsComp from "@/components/ui/no-items";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export default function ProductsPage() {
  const t = useTranslate();
  const navigate = useNavigate();
  const location = useLocation();
  const { products, loading, error, categories } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    location.state?.selectedCategory || null
  );

  const sortByOptions = [
    { value: "newest", label: t("Newest First") },
    { value: "oldest", label: t("Oldest First") },
    { value: "price-low", label: t("Price: Low to High") },
    { value: "price-high", label: t("Price: High to Low") },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showSortDrawer, setShowSortDrawer] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState<{
    min: number;
    max: number | null;
  }>({ min: 0, max: null });
  const [inStock, setInStock] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Filter and sort products
  const filteredProducts = products
    .filter(
      (product) =>
        (selectedCategory ? product.category_id === selectedCategory : true) &&
        (searchQuery
          ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase())
          : true) &&
        (inStock
          ? product.product_variants?.some((v) => v.quantity > 0) ?? false
          : true) &&
        (priceRange.min !== null ? product.price >= priceRange.min : true) &&
        (priceRange.max !== null ? product.price <= priceRange.max : true)
    )
    .sort((a, b) => {
      // Helper function to get the highest price from variants or base price
      const getHighestPrice = (product: Product) => {
        if (!product.product_variants?.length) return product.price;
        const variantPrices = product.product_variants.map((v) => v.price);
        return Math.max(product.price, ...variantPrices);
      };

      switch (sortBy) {
        case "price-low":
          return getHighestPrice(a) - getHighestPrice(b);
        case "price-high":
          return getHighestPrice(b) - getHighestPrice(a);
        case "oldest":
          return (
            new Date(a.start_datetime).getTime() -
            new Date(b.start_datetime).getTime()
          );
        default: // newest
          return (
            new Date(b.start_datetime).getTime() -
            new Date(a.start_datetime).getTime()
          );
      }
    });

  const formattedDate = (product: any) => {
    return (
      product?.start_datetime &&
      product?.end_datetime &&
      `${format(
        new Date(product.start_datetime),
        formattedDateAndTime
      )} - ${format(new Date(product.end_datetime), formattedDateAndTime)}`
    );
  };

  return (
    <div className="bg-background">
      {/* Search Bar */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="px-5 pt-4 py-2 flex items-center w-full gap-2">
          <div className="relative w-full">
            <Input
              className="pl-10 h-12 bg-darkgray border border-input"
              placeholder={t("Search products...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white h-12 !bg-transparent"
            onClick={() => navigate("/cart")}
          >
            <ShoppingCart className="h-6 w-6" />
          </Button>
        </div>

        {/* Category Pills */}
        <CategoryGrid
          categories={categories}
          isLoading={loading}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Filter & Sort Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground px-0 !bg-background"
            onClick={() => setShowFilterDrawer(true)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {t("Filter")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground px-0 !bg-background"
            onClick={() => setShowSortDrawer(true)}
          >
            <ArrowUpDown className="w-4 h-4 mr-2" />
            {t("Sort")}
          </Button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="p-5">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AnimatedCard
                      id={product.id}
                      image={product.image}
                      title={product.name}
                      price={product.price}
                      compareAtPrice={
                        product.product_variants?.[0]?.compare_at_price ||
                        undefined
                      }
                      product_variants={product.product_variants}
                      location={product.location}
                      date={formattedDate(product)}
                      gallery_link={product.gallery_link}
                      imageClassName="max-h-[220px] h-[40vw]"
                      onClick={() => {
                        // Get the default variant if product has variants
                        const defaultVariant = product.product_variants?.[0];
                        if (defaultVariant) {
                          setSelectedProduct({
                            ...product,
                            variant_id: defaultVariant.id,
                            quantity: defaultVariant.quantity,
                          });
                        } else {
                          setSelectedProduct(product);
                        }
                      }}
                      end_datetime={product.end_datetime}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <NoItemsComp
                icon={Package2}
                className="py-12"
                text={
                  searchQuery
                    ? "No products found matching your search"
                    : "No products found"
                }
              />
            )}
          </>
        )}
      </div>

      {/* Filter Drawer */}
      <Sheet open={showFilterDrawer} onOpenChange={setShowFilterDrawer}>
        <SheetContent side="bottom" className="h-[70%] p-0 max-width-mobile">
          <SheetHeader className="px-5 pb-3 pt-8 border-b sticky top-0 bg-background/80 backdrop-blur-xl flex flex-row items-center">
            <SheetTitle className="text-lg font-semibold">
              {t("Filter Products")}
            </SheetTitle>
          </SheetHeader>
          <div className="p-5 space-y-6 overflow-auto h-[calc(100%_-_160px)]">
            <div className="space-y-4">
              <h3 className="text-base font-medium">{t("Price Range")}</h3>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  placeholder={t("Min")}
                  value={priceRange.min || ""}
                  onChange={(e) =>
                    setPriceRange((prev) => ({
                      ...prev,
                      min: Number(e.target.value) || 0,
                    }))
                  }
                  className="h-10"
                />
                <span>-</span>
                <Input
                  type="number"
                  placeholder={t("Max")}
                  value={priceRange.max || ""}
                  onChange={(e) =>
                    setPriceRange((prev) => ({
                      ...prev,
                      max: Number(e.target.value) || null,
                    }))
                  }
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-medium">{t("Categories")}</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={category.id}
                      checked={selectedCategory === category.id}
                      onCheckedChange={() =>
                        setSelectedCategory(
                          selectedCategory === category.id ? null : category.id
                        )
                      }
                    />
                    <label
                      htmlFor={category.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-medium">{t("Availability")}</h3>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-stock"
                  checked={inStock}
                  onCheckedChange={(checked) => setInStock(checked as boolean)}
                />
                <label
                  htmlFor="in-stock"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t("In Stock")}
                </label>
              </div>
            </div>
          </div>

          <div className="p-5 border-t bg-background/80 backdrop-blur-xl fixed w-full bottom-0 max-width-mobile">
            <Button
              className="w-full main-btn"
              onClick={() => setShowFilterDrawer(false)}
            >
              {t("Apply Filters")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Sort Drawer */}
      <Sheet open={showSortDrawer} onOpenChange={setShowSortDrawer}>
        <SheetContent side="bottom" className="h-fit p-0">
          <SheetHeader className="px-5 pb-3 pt-8 border-b sticky top-0 bg-background/80 backdrop-blur-xl flex flex-row items-center">
            <SheetTitle className="text-lg font-semibold">
              {t("Sort By")}
            </SheetTitle>
          </SheetHeader>
          <div className="p-4">
            {sortByOptions.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => {
                  setSortBy(option.value);
                  setShowSortDrawer(false);
                }}
                className={cn(
                  "w-full px-4 py-3 rounded-lg",
                  "flex items-center justify-between",
                  "transition-colors duration-200",
                  "hover:bg-muted",
                  sortBy === option.value && "bg-primary/10"
                )}
                whileTap={{ scale: 0.98 }}
              >
                <span className="font-medium">{option.label}</span>
                {sortBy === option.value && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </motion.button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Product Detail */}
      {selectedProduct && (
        <ProductDetail
          {...selectedProduct}
          location={selectedProduct.location}
          date={formattedDate(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
