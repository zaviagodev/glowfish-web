import { useTranslate } from "@refinedev/core";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Filter, ArrowUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/lib/supabase";
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

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export default function ProductsPage() {
  const t = useTranslate();
  const { products, categories, loading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showSortDrawer, setShowSortDrawer] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState<{min: number, max: number | null}>({ min: 0, max: null });
  const [inStock, setInStock] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Filter and sort products
  const filteredProducts = products
    .filter(product => 
      (selectedCategory ? product.category_id === selectedCategory : true) &&
      (searchQuery ? 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
        : true) &&
      (inStock ? (product.product_variants?.some(v => v.quantity > 0) ?? false) : true) &&
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
          return (a.created_at ? new Date(a.created_at).getTime() : 0) - 
                 (b.created_at ? new Date(b.created_at).getTime() : 0);
        default: // newest
          return (b.created_at ? new Date(b.created_at).getTime() : 0) - 
                 (a.created_at ? new Date(a.created_at).getTime() : 0);
      }
    });

  // Get price display for a product
  const getPriceDisplay = (product: any) => {
    if (!product.product_variants || product.product_variants.length === 0) {
      return product.price === 0 ? t("free") : `฿${product.price.toLocaleString()}`;
    }

    if (product.product_variants.length === 1) {
      return `฿${product.product_variants[0].price.toLocaleString()}`;
    }

    const prices = product.product_variants.map((v: any) => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return `฿${minPrice.toLocaleString()}`;
    }

    return `฿${minPrice.toLocaleString()} - ฿${maxPrice.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Search Bar */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="p-4">
          <div className="relative">
            <Input
              className="pl-10 h-12 bg-[rgba(245,245,245,0.5)] border-[#E5E5E5] text-black"
              placeholder={t("Search products...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-4 px-4 overflow-auto py-2 scrollbar-hide">
          <Button 
            onClick={() => setSelectedCategory(null)}
            variant={selectedCategory === null ? "default" : "secondary"}
            className="rounded-full text-sm font-medium"
          >
            {t("All")}
          </Button>
          {categories.map(category => (
            <Button 
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              variant={selectedCategory === category.id ? "default" : "secondary"}
              className="rounded-full text-sm font-medium whitespace-nowrap"
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Filter & Sort Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setShowFilterDrawer(true)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {t("Filter")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setShowSortDrawer(true)}
          >
            <ArrowUpDown className="w-4 h-4 mr-2" />
            {t("Sort")}
          </Button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="p-4">
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
                price={getPriceDisplay(product)}
                compareAtPrice={product.compare_at_price}
                onClick={() => {
                  // Get the default variant if product has variants
                  const defaultVariant = product.product_variants?.[0];
                  if (defaultVariant) {
                    setSelectedProduct({
                      ...product,
                      variant_id: defaultVariant.id,
                      quantity: defaultVariant.quantity
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
          <SheetHeader className="px-4 py-3 border-b sticky top-0 bg-background/80 backdrop-blur-xl flex flex-row items-center justify-between">
            <SheetTitle className="text-lg font-semibold">
              {t("Filter Products")}
            </SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary font-medium hover:bg-transparent"
              onClick={() => setShowFilterDrawer(false)}
            >
              {t("Close")}
            </Button>
          </SheetHeader>
          <div className="p-4 space-y-6 overflow-auto">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">{t("Price Range")}</h3>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  placeholder={t("Min")}
                  value={priceRange.min || ""}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) || 0 }))}
                  className="h-10"
                />
                <span>-</span>
                <Input
                  type="number"
                  placeholder={t("Max")}
                  value={priceRange.max || ""}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) || null }))}
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">{t("Categories")}</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.id}
                      checked={selectedCategory === category.id}
                      onCheckedChange={() => setSelectedCategory(
                        selectedCategory === category.id ? null : category.id
                      )}
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

          <div className="p-4 border-t bg-background/80 backdrop-blur-xl">
            <Button 
              className="w-full bg-primary text-primary-foreground"
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
          <SheetHeader className="px-4 py-3 border-b sticky top-0 bg-background/80 backdrop-blur-xl flex flex-row items-center justify-between">
            <SheetTitle className="text-lg font-semibold">
              {t("Sort By")}
            </SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary font-medium hover:bg-transparent"
              onClick={() => setShowSortDrawer(false)}
            >
              {t("Close")}
            </Button>
          </SheetHeader>
          <div className="p-4">
            <Select value={sortBy} onValueChange={(value) => {
              setSortBy(value);
              setShowSortDrawer(false);
            }}>
              <SelectTrigger>
                <SelectValue placeholder={t("Select sort order")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("Newest First")}</SelectItem>
                <SelectItem value="oldest">{t("Oldest First")}</SelectItem>
                <SelectItem value="price-low">{t("Price: Low to High")}</SelectItem>
                <SelectItem value="price-high">{t("Price: High to Low")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </SheetContent>
      </Sheet>

      {/* Product Detail */}
      {selectedProduct && (
        <ProductDetail
          {...selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}