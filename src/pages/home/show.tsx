import { CalendarIcon, Location } from "@/components/icons/MainIcons";
import Header from "@/components/main/Header";
import { useTranslate } from "@refinedev/core";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetOverlay,
  SheetTrigger,
} from "@/components/ui/sheet";
import GlowfishIcon from "@/components/icons/GlowfishIcon";
import { useState, useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/lib/supabase";

interface Variant {
  id: string;
  name: string;
  price: number;
  quantity: number;
  options: Record<string, string>;
}

interface VariantOption {
  id: string;
  name: string;
  values: string[];
  position: number;
}

export const HomeShow = () => {
  const t = useTranslate();
  const { id } = useParams();
  const navigate = useNavigate();
  const [numOfParticipants, setNumOfParticipants] = useState(500);
  const [isConfirming, setIsConfirming] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const { products, loading, error } = useProducts();

  // Find the current product
  const product = products.find(p => p.id === id);
  const variantOptions: VariantOption[] = product?.variant_options || [];
  const hasVariants = variantOptions.length > 0;

  // Fetch variants when sheet opens
  const fetchVariants = async () => {
    if (!hasVariants) {
      // If no variants, create a default variant from product data
      const defaultVariant = {
        id: product?.product_variants[0]?.id,
        name: product?.name,
        price: product?.price || 0,
        quantity: 0,
        options: {}
      };
      setVariants([defaultVariant]);
      setSelectedVariant(defaultVariant);
      return;
    }

    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', id)
      .eq('status', 'active');

    if (data) {
      setVariants(data);
      // Reset selected attributes
      setSelectedAttributes({});
      setSelectedVariant(null);
    }
  };

  // Find matching variant based on selected attributes
  useEffect(() => {
    if (!hasVariants) return;

    if (Object.keys(selectedAttributes).length === variantOptions.length) {
      const matchingVariant = variants.find(variant => {
        return Object.entries(selectedAttributes).every(([attrName, attrValue]) => {
          return variant.options.some(opt => 
            opt.name === attrName && opt.value === attrValue
          );
        });
      });
      
      setSelectedVariant(matchingVariant || null);
    } else {
      setSelectedVariant(null);
    }
  }, [selectedAttributes, variants, variantOptions.length, hasVariants]);

  const handleAttributeSelect = (optionName: string, value: string) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [optionName]: value
    }));
  };

  const handleCheckout = () => {
    if (!product) return;
  
    const { id: productId, name: productName, price: productPrice, image, product_variants } = product;
    const variantId = selectedVariant?.id || product_variants[0].id;
    const variantName = hasVariants
      ? Object.entries(selectedAttributes)
          .map(([key, value]) => `${key}: ${value}`)
          .join(' | ')
      : '';
  
    const price = selectedVariant?.price || productPrice;


    navigate('/checkout', {
      state: {
        productId,
        variantId,
        productName,
        variantName,
        price,
        image,
      },
    });
  };
  

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Error: {error || 'Product not found'}</p>
      </div>
    );
  }

  return (
    <>
      <Header className="bg-transparent border-0" />
      <img src={product.image} className="w-full z-100"/>
      <section className="p-5 bg-background/80 relative -top-10 backdrop-blur-sm rounded-[14px] flex flex-col gap-7 mb-[120px]">
        <div className="flex flex-col gap-1.5">
          <h2 className="page-title">{product.name}</h2>
          <div className="flex items-center gap-2 text-xs">
            <Location />
            <p>{product.location}</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <CalendarIcon />
            <p>{product.date}</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex -space-x-3">
            <Avatar className="h-7 w-7">
              <AvatarImage src="https://github.com/shadcn.png"/>
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar className="h-7 w-7">
              <AvatarImage src="https://github.com/shadcn.png"/>
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar className="h-7 w-7">
              <AvatarImage src="https://github.com/shadcn.png"/>
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
          <h2 className="page-title">{t("participant", {count: numOfParticipants})}</h2>
        </div>
        {product.description && (
          <div className="flex flex-col gap-1.5">
            <h2 className="font-medium text-sm">{t("Description")}</h2>
            <p className="text-xs">{product.description}</p>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <h2 className="font-medium text-sm">{t("Venue & Location")}</h2>
          <p className="text-xs">{product.description}</p>
        </div>
      </section>
      <footer className="btn-footer flex flex-col gap-7">
        <div className="space-y-1">
          <p className="text-xs">{t("Start from")}</p>
          <h2 className="font-sfpro-rounded font-semibold">
            {hasVariants 
              ? (selectedVariant ? `฿${selectedVariant.price}` : `฿${product.price}`)
              : `฿${product.price}`}
          </h2>
        </div>
        <Sheet 
          open={isConfirming} 
          onOpenChange={(open) => {
            setIsConfirming(open);
            if (open) {
              fetchVariants();
            }
          }}
        >
          <SheetOverlay className="backdrop-blur-sm bg-transparent"/>
          <SheetTrigger className="main-btn !bg-[#EE5736]">{t("Sign up")}</SheetTrigger>
          <SheetContent className="h-[60%] !p-0 border-0 outline-none bg-background rounded-t-2xl p-5 flex flex-col" side="bottom">
            <section>
              <header className="flex justify-between p-5 border-b border-b-header">
                <GlowfishIcon />
                <span 
                  className="font-semibold bg-[#FFFFFF1F] rounded-full h-[30px] w-[30px] font-sfpro-rounded flex items-center justify-center"
                  onClick={() => setIsConfirming(false)}
                >
                  ✕
                </span>
              </header>
              <main className="p-5 space-y-4">
                {hasVariants && variantOptions.map((option) => (
                  <div key={option.id} className="space-y-2">
                    <h3 className="font-semibold">{option.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => (
                        <Button
                          key={value}
                          onClick={() => handleAttributeSelect(option.name, value)}
                          className={`px-4 py-2 ${
                            selectedAttributes[option.name] === value 
                              ? 'bg-mainorange' 
                              : 'bg-darkgray'
                          }`}
                        >
                          {value}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </main>
            </section>
            <footer className="space-y-4 px-5 py-10">
              <div className="text-center">
                <p className="text-sm">{t("Total cost")}</p>
                <h2 className="text-2xl font-sfpro-rounded font-medium">
                  {hasVariants 
                    ? (selectedVariant ? `฿${selectedVariant.price}` : '-')
                    : `฿${product.price}`}
                </h2>
              </div>
              <Button 
                className="main-btn !bg-mainorange w-full"
                disabled={hasVariants && !selectedVariant}
                onClick={handleCheckout}
              >
                {t("Continue")}
              </Button>
            </footer>
          </SheetContent>
        </Sheet>
      </footer>
    </>
  );
};