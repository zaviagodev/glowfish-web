import { MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface AddressCardProps {
  title: string;
  name: string;
  phone: string;
  address: string;
  className?: string;
  isDefault?: boolean;
}

export function AddressCard({
  title,
  name,
  phone,
  address,
  className,
  isDefault,
}: AddressCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className={cn("bg-darkgray rounded-lg px-3 py-4", className)}
      onClick={() => navigate("/checkout/address")}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium">{title}</h2>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg bg-icon-blue-background flex items-center justify-center">
            <MapPin className="w-4 h-4 text-icon-blue-foreground" />
          </div>
        </div>
        {isDefault ? (
          <div>
            <p className="text-sm font-medium">
              {name} | {phone}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{address}</p>
          </div>
        ) : (
          <p className="text-sm font-medium">Add Delivery Address</p>
        )}
      </div>
    </div>
  );
}
