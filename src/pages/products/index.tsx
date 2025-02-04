import { useTranslate } from "@refinedev/core";
import { useState } from "react";
import { motion } from "framer-motion";
import { Filter, ArrowUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { useProducts } from "@/hooks/useProducts";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductDetail } from "@/components/product/ProductDetail";
import { useLocation } from "react-router-dom";
import { CategoryGrid } from "@/components/home/CategoryGrid";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export default function ProductsPage() {
  const t = useTranslate();
  const location = useLocation();
  const { products, loading, error, categories } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    location.state?.selectedCategory || null
  );
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
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        default: // newest
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortBy === "oldest") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return 0;
  });

  const formattedDate = (product: any) => {
    return (
      product?.start_datetime &&
      product?.end_datetime &&
      `${format(
        new Date(product.start_datetime),
        "dd-MM-yyyy HH:mm"
      )} - ${format(new Date(product.end_datetime), "dd-MM-yyyy HH:mm")}`
    );
  };

  return (
    <div className="bg-background">
      {/* Search Bar */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="px-5 pt-4 py-2">
          <div className="relative">
            <Input
              className="pl-10 h-12 bg-darkgray border border-input"
              placeholder={t("Search products...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>
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
                  product.product_variants?.[0]?.compare_at_price || undefined
                }
                product_variants={product.product_variants}
                location={product.location}
                date={formattedDate(product)}
                description={product.description}
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
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Filter Drawer */}
      <Sheet open={showFilterDrawer} onOpenChange={setShowFilterDrawer}>
        <SheetContent side="bottom" className="h-[70%] p-0">
          <SheetHeader className="px-5 py-3 border-b sticky top-0 bg-background/80 backdrop-blur-xl flex flex-row items-center">
            <SheetTitle className="text-lg font-semibold">
              {t("Filter Products")}
            </SheetTitle>
          </SheetHeader>
          <div className="p-5 space-y-6 overflow-auto">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">{t("Price Range")}</h3>
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
              <h3 className="text-sm font-medium">{t("Categories")}</h3>
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
              <h3 className="text-sm font-medium">{t("Availability")}</h3>
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

          <div className="p-5 border-t bg-background/80 backdrop-blur-xl fixed w-full bottom-0">
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
        <SheetContent side="bottom" className="h-[40%] p-0">
          <SheetHeader className="px-5 py-3 border-b sticky top-0 bg-background/80 backdrop-blur-xl flex flex-row items-center">
            <SheetTitle className="text-lg font-semibold">
              {t("Sort By")}
            </SheetTitle>
          </SheetHeader>
          <div className="p-4">
            <Select
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value);
                setShowSortDrawer(false);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("Select sort order")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("Newest First")}</SelectItem>
                <SelectItem value="oldest">{t("Oldest First")}</SelectItem>
                <SelectItem value="price-low">
                  {t("Price: Low to High")}
                </SelectItem>
                <SelectItem value="price-high">
                  {t("Price: High to Low")}
                </SelectItem>
              </SelectContent>
            </Select>
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
