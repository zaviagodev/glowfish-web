import { useTranslate } from "@refinedev/core";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  compare_at_price: number | null;
  quantity: number;
  options: Record<string, any>;
  status: string;
  position: number;
}

interface VariantOption {
  id: string;
  name: string;
  values: string[];
  position: number;
}

interface VariantDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (variantId: string) => void;
  variants: ProductVariant[];
  variantOptions: VariantOption[];
  selectedVariantId?: string;
}

export function VariantDrawer({
  open,
  onClose,
  onSelect,
  variants,
  variantOptions,
  selectedVariantId
}: VariantDrawerProps) {
  const t = useTranslate();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Initialize selected options from current variant
  useEffect(() => {
    if (selectedVariantId) {
      const variant = variants.find(v => v.id === selectedVariantId);
      if (variant) {
        setSelectedOptions(variant.options);
      }
    }
  }, [selectedVariantId, variants]);

  // Find matching variant based on selected options
  const findMatchingVariant = () => {
    return variants.find(variant => {
      return Object.entries(selectedOptions).every(([key, value]) => 
        variant.options[key] === value
      );
    });
  };

  // Get available values for an option based on current selections
  const getAvailableValues = (optionName: string) => {
    const otherSelections = { ...selectedOptions };
    delete otherSelections[optionName];

    const availableValues = variants
      .filter(variant => 
        Object.entries(otherSelections).every(([key, value]) => 
          variant.options[key] === value
        )
      )
      .map(variant => variant.options[optionName])
      .filter((value, index, self) => self.indexOf(value) === index);

    // Log available values for debugging
    console.log(`Available values for ${optionName}:`, availableValues);
    
    return availableValues;
  };

  // Handle option selection
  const handleOptionSelect = (optionName: string, value: string) => {
    const newSelections = {
      ...selectedOptions,
      [optionName]: value
    };
    setSelectedOptions(newSelections);

    // Find matching variant
    const matchingVariant = variants.find(variant => 
      Object.entries(newSelections).every(([key, val]) => 
        variant.options[key] === val
      )
    );

    // If we have a complete match, call onSelect
    if (matchingVariant && 
        Object.keys(newSelections).length === variantOptions.length) {
      onSelect(matchingVariant.id);
    }
  };

  // Get current variant
  const currentVariant = findMatchingVariant();

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className="h-[85%] p-0 bg-background rounded-t-[14px]"
      >
        <SheetHeader className="px-4 py-3 border-b sticky top-0 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">
              {t("Select Options")}
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="p-4 space-y-6">
          {/* Variant Options */}
          {variantOptions.sort((a, b) => a.position - b.position).map((option) => (
            <div key={option.id} className="space-y-3">
              <h3 className="text-sm font-medium">
                {option.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const isAvailable = getAvailableValues(option.name).includes(value);
                  const isSelected = selectedOptions[option.name] === value;

                  return (
                    <Button
                      key={value}
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "h-9 px-4 rounded-full",
                        !isAvailable && "opacity-50 cursor-not-allowed"
                      )}
                      disabled={!isAvailable}
                      onClick={() => handleOptionSelect(option.name, value)}
                    >
                      {value}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Price Display */}
          {currentVariant && (
            <div className="pt-4 border-t">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  ฿{currentVariant.price.toLocaleString()}
                </span>
                {currentVariant.compare_at_price && (
                  <>
                    <span className="text-sm line-through text-muted-foreground">
                      ฿{currentVariant.compare_at_price.toLocaleString()}
                    </span>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#EE4D2D]/10 text-[#EE4D2D]">
                      {Math.round((1 - (currentVariant.price / currentVariant.compare_at_price)) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
              {currentVariant.quantity > 0 ? (
                <p className="text-sm text-muted-foreground mt-1">
                  {t("{{count}} in stock", { count: currentVariant.quantity })}
                </p>
              ) : (
                <p className="text-sm text-destructive mt-1">
                  {t("Out of stock")}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <div className="p-4 border-t bg-background/80 backdrop-blur-xl">
          <Button 
            className="w-full bg-black text-white h-12"
            disabled={!currentVariant || currentVariant.quantity === 0}
            onClick={() => {
              if (currentVariant) {
                onSelect(currentVariant.id);
                onClose();
              }
            }}
          >
            {currentVariant?.quantity === 0 
              ? t("Out of Stock")
              : t("Add to Cart")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}