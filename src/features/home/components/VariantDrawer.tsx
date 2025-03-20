import { useTranslate } from "@refinedev/core";
import { motion } from "framer-motion";
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
import { useNavigate } from "react-router-dom";
import { ProductVariant } from "@/type/type 2";
import { useConfig } from "@/hooks/useConfig";
import DefaultStorefront from "@/components/icons/DefaultStorefront";

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
  onSubmit: () => void;
  variants: ProductVariant[];
  variantOptions: VariantOption[];
  selectedVariantId?: string;
  track_quantity?: boolean;
}

export function VariantDrawer({
  open,
  onClose,
  onSelect,
  onSubmit,
  variants,
  variantOptions,
  selectedVariantId,
  track_quantity,
}: VariantDrawerProps) {
  const t = useTranslate();
  const navigate = useNavigate();
  const { config } = useConfig();
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});

  // Initialize selected options from current variant
  useEffect(() => {
    if (selectedVariantId) {
      const variant = variants.find((v) => v.id === selectedVariantId);
      if (variant) {
        const optionsRecord = variant.options.reduce(
          (acc, opt) => ({
            ...acc,
            [opt.name]: opt.value,
          }),
          {}
        );
        setSelectedOptions(optionsRecord);
      }
    }
  }, [selectedVariantId, variants]);

  // Find matching variant based on selected options
  const findMatchingVariant = () => {
    return variants.find((variant) => {
      return Object.entries(selectedOptions).every(([key, value]) =>
        variant.options.some((opt) => opt.name === key && opt.value === value)
      );
    });
  };

  // Get available values for an option based on current selections
  const getAvailableValues = (optionName: string) => {
    if (!variants || variants.length === 0) {
      return [];
    }

    const otherSelections = { ...selectedOptions };
    delete otherSelections[optionName];

    const availableValues = variants
      .filter((variant) =>
        Object.entries(otherSelections).every(([key, value]) =>
          variant.options.some((opt) => opt.name === key && opt.value === value)
        )
      )
      .map(
        (variant) =>
          variant.options.find((opt) => opt.name === optionName)?.value
      )
      .filter((value): value is string => value !== undefined)
      .filter((value, index, self) => self.indexOf(value) === index);

    return availableValues;
  };

  // Handle option selection
  const handleOptionSelect = (optionName: string, value: string) => {
    const newSelections = {
      ...selectedOptions,
      [optionName]: value,
    };
    setSelectedOptions(newSelections);

    // Find matching variant
    const matchingVariant = variants.find((variant) =>
      Object.entries(newSelections).every(([key, val]) =>
        variant.options.some((opt) => opt.name === key && opt.value === val)
      )
    );

    // If we have a complete match, call onSelect
    if (matchingVariant) {
      onSelect(matchingVariant.id);
    }
  };

  // Get current variant
  const currentVariant = findMatchingVariant();

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="h-fit p-0 bg-background rounded-t-[14px] max-width-mobile"
      >
        <SheetHeader className="px-5 py-6 border-b sticky top-0 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">
              {config?.storeLogo ? (
                <img
                  src={config.storeLogo}
                  alt="Store Logo"
                  className="w-[100px] object-contain"
                />
              ) : (
                <DefaultStorefront />
              )}
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="p-5 space-y-6 pb-[220px] overflow-auto">
          {/* Variant Options */}
          {variantOptions
            .sort((a, b) => a.position - b.position)
            .map((option) => (
              <div key={option.id} className="space-y-3">
                <h3 className="text-base font-medium">{option.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => {
                    const isAvailable = !track_quantity
                      ? true
                      : getAvailableValues(option.name).includes(value);
                    const isSelected = selectedOptions[option.name] === value;

                    return (
                      <Button
                        key={value}
                        // variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "!h-9 px-4 rounded-lg !text-sm font-semibold relative",
                          !isSelected
                            ? "bg-darkgray border-input text-primary"
                            : "main-btn !rounded-lg",
                          !isAvailable && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={!isAvailable}
                        onClick={() => handleOptionSelect(option.name, value)}
                      >
                        {/* TODO: set the condition of this red circle if there is a sales_price */}
                        <div className="absolute -top-2 -right-2 bg-[#DE473C] text-white rounded-full px-1.5 w-fit text-[10px]">
                          Sale
                        </div>
                        {value}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>

        {/* Add to Cart Button */}
        <div className="p-5 border-t bg-background/80 backdrop-blur-xl fixed w-full bottom-0 space-y-3 max-width-mobile">
          {/* Price Display */}
          {currentVariant && (
            <div className="flex flex-col items-center">
              {currentVariant.compare_at_price &&
                currentVariant.compare_at_price > 0 && (
                  <span className="text-sm text-muted-foreground line-through">
                    ฿{currentVariant.compare_at_price.toLocaleString()}
                  </span>
                )}
              <span className="text-2xl font-bold">
                ฿{currentVariant.price.toLocaleString()}
              </span>

              {track_quantity ? (
                currentVariant.quantity > 0 ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentVariant.quantity} items in stock
                  </p>
                ) : (
                  <p className="text-sm text-red-500 font-semibold mt-1">
                    Out of stock
                  </p>
                )
              ) : (
                <p className="text-sm text-muted-foreground mt-1">In stock</p>
              )}
            </div>
          )}
          <Button
            className="w-full main-btn"
            disabled={
              !currentVariant ||
              (track_quantity ? currentVariant.quantity === 0 : false)
            }
            onClick={() => {
              if (currentVariant) {
                onSelect(currentVariant.id);
                onSubmit();
              }
            }}
          >
            {track_quantity && currentVariant?.quantity === 0
              ? "Out of Stock"
              : "Confirm booking"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
