import { useState, useRef, useEffect } from "react";
import { useTranslate } from "@refinedev/core";
import { Filter, Notification, Search } from "@/components/icons/MainIcons";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GlowfishIcon from "@/components/icons/GlowfishIcon";
import Header from "@/components/main/Header";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const productSliderRef = useRef<HTMLDivElement>(null);

  const filteredProducts = selectedCategory
    ? products.filter(product => product.category_id === selectedCategory)
    : products;

  
  const searchResults = filteredProducts.filter(product => 
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

  const getPriceDisplay = (product: any) => {
    if (!product.product_variants || product.product_variants.length === 0) {
      return product.price === 0 ? t("free") : `${product.price.toLocaleString()}`;
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

  return (
    <div className="min-h-full relative">
      {/* Hero Section */}
      <div className="relative">
        <section className={cn(
          "relative w-full overflow-hidden",
          "bg-gradient-to-br from-primary/5 via-primary/10 to-transparent",
          "pb-[25px]"
        )}>
          {/* Background Pattern */}
          <div className={cn(
            "absolute inset-0 opacity-[0.15]",
            "bg-[radial-gradient(circle_at_1px_1px,var(--primary)_1px,transparent_0)]",
            "bg-[size:24px_24px]",
            "[mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]"
          )} />

          {/* Content Container */}
          <div className="relative py-6">
            <div className="flex items-center justify-between">
              <div className="px-5">
                <GlowfishIcon />
              </div>
              <Link to="/rewards">
                <div className="px-5">
                  <Avatar className="h-[50px] w-[50px] border-2 border-border">
                    <AvatarImage src={userProfile?.avatar_url || "https://github.com/shadcn.png"}/>
                    <AvatarFallback>
                      {userProfile?.full_name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </Link>
            </div>

            <div className="relative flex items-center text-sm mt-6 px-5">
              <div className="relative w-full shadow-lg">
                <Input 
                  className="h-10 pl-10 bg-background text-foreground border border-input rounded-full" 
                  placeholder={t("Search event..")}
                  onClick={() => setIsSearchOpen(true)}
                  readOnly
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"/>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Search Dialog */}
      <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <Command>
          <div className="sr-only">{t("Search Products")}</div>
          <CommandInput 
            placeholder={t("Search events...")}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>{t("No results found.")}</CommandEmpty>
            <CommandGroup>
              {searchResults.map((product) => (
                <CommandItem
                  key={product.id}
                  onSelect={() => handleProductSelect(product)}
                >
                  <div className="flex items-center gap-2">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-8 h-8 rounded object-cover"
                    />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {getPriceDisplay(product)}
                      </p>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>

      {/* Category Bar */}
      <div className="sticky top-0 z-50 bg-background border-y">
        <div className="flex items-center gap-4 px-5 overflow-auto py-6 scrollbar-hide">
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
      </div>

      {/* Product Section */}
      <section className="px-5 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">{t("Products")}</h2>
          <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground">
            {t("See all")}
          </Link>
        </div>

        <div className="relative group -mx-5 px-5">
          <Button
            variant="outline"
            size="icon"
            className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-background border-border"
            onClick={() => {
              if (productSliderRef.current) {
                productSliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
              }
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div 
            ref={productSliderRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-6"
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[300px]"
                onClick={() => handleProductSelect(product)}
              >
                <AnimatedCard
                  id={product.id}
                  image={product.image}
                  title={product.name}
                  price={getPriceDisplay(product)}
                  compareAtPrice={product.compare_at_price}
                  description={product.description}
                />
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-background border-border"
            onClick={() => {
              if (productSliderRef.current) {
                productSliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
              }
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
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