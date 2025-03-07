import { MapPin, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface AddressCardProps {
  title: string;
  name: string;
  phone: string;
  address: string;
  className?: string;
  isDefault?: boolean;
  icon: ReactNode;
}

export function AddressCard({
  title,
  name,
  phone,
  address,
  className,
  isDefault,
  icon,
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
        <div className="flex items-center">{icon}</div>
        <div>
          <p className="text-sm font-medium">
            {isDefault ? `${name} | ${phone}` : title}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isDefault ? address : "Select an address"}
          </p>
        </div>
      </div>
    </div>
  );
}
