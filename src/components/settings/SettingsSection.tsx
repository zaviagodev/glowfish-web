import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Ticket } from "lucide-react";

export interface SettingsItem {
  icon: string | React.ReactNode;
  label: string;
  path?: string;
  component?: React.ReactNode;
  showArrow?: boolean;
}

interface SettingsSectionProps {
  title: string;
  items: SettingsItem[];
  index?: number;
}

export function SettingsSection({
  title,
  items,
  index = 0,
}: SettingsSectionProps) {
  const t = useTranslate();
  const navigate = useNavigate();

  return (
    // <div className={cn("px-4 py-6", index > 0 && "border-t border-[#F5F5F5]")}>
    <div className={cn("px-4 py-6")}>
      <h2 className="text-sm font-medium text-muted-foreground mb-2">
        {title}
      </h2>
      <div className="rounded-lg bg-darkgray overflow-hidden">
        {items.map((item, itemIndex) => (
          <div
            key={item.label}
            className={cn(
              "flex items-center justify-between p-4"
              // itemIndex > 0 && "border-t border-[#F5F5F5]"
            )}
            onClick={() => item.path && navigate(item.path)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-lg">
                {item.icon}
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            {item.component
              ? item.component
              : item.showArrow && (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
          </div>
        ))}
      </div>
    </div>
  );
}
