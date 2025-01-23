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
}

export function AddressCard({
  title,
  name,
  phone,
  address,
  className
}: AddressCardProps) {
  const navigate = useNavigate();

  return (
    <div className={cn(
      "bg-[rgba(245,245,245,0.5)] rounded-lg border border-[#E5E5E5]",
      className
    )} 
    onClick={() => navigate('/checkout/address')}>
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EBEBEB] flex items-center justify-center">
            <MapPin className="w-4 h-4 text-muted-foreground" />
          </div>
          <h2 className="text-sm font-medium">
            {title}
          </h2>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="px-3 pb-3">
        <p className="text-xs font-medium">
          {name} | {phone}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {address}
        </p>
      </div>
    </div>
  );
}