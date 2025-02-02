import { useTranslate } from "@refinedev/core";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Product } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface SearchDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchResults: Product[];
  onProductSelect: (product: Product) => void;
}

const SearchItem = forwardRef<
  HTMLDivElement,
  { product: Product; onSelect: () => void }
>(({ product, onSelect }, ref) => {
  const t = useTranslate();

  return (
    <div
      ref={ref}
      onClick={onSelect}
      className={cn(
        "flex items-center gap-2",
        "cursor-pointer hover:bg-accent rounded-md"
      )}
    >
      <img
        src={product.image}
        alt={product.name}
        className="w-12 h-12 rounded-lg object-cover"
      />
      <div>
        <p className="font-medium truncate">{product.name}</p>
        <p className="text-sm text-muted-foreground">
          {product.price === 0
            ? t("free")
            : `฿${product.price.toLocaleString()}`}
        </p>
      </div>
    </div>
  );
});

SearchItem.displayName = "SearchItem";

export function SearchDialog({
  isOpen,
  onOpenChange,
  searchQuery,
  onSearchChange,
  searchResults,
  onProductSelect,
}: SearchDialogProps) {
  const t = useTranslate();

  return (
    <CommandDialog open={isOpen} onOpenChange={onOpenChange}>
      <Command>
        <CommandInput
          placeholder={t("Search events...")}
          value={searchQuery}
          onValueChange={onSearchChange}
          className="border-none focus:ring-0 pl-0 pr-7"
        />
        <CommandList>
          <CommandEmpty>{t("No results found.")}</CommandEmpty>
          <CommandGroup>
            {searchResults.map((product) => (
              <CommandItem
                key={product.id}
                value={product.id.toString()}
                onSelect={() => onProductSelect(product)}
              >
                <SearchItem
                  product={product}
                  onSelect={() => onProductSelect(product)}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
