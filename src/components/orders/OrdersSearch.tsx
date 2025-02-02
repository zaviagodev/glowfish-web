import { useTranslate } from "@refinedev/core";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface OrdersSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function OrdersSearch({ value, onChange }: OrdersSearchProps) {
  const t = useTranslate();

  return (
    <div className="p-4">
      <div className="relative">
        <Input
          className="pl-10 h-12 bg-darkgray border-input"
          placeholder={t("Search orders...")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      </div>
    </div>
  );
}
