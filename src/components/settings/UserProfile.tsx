import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCustomer } from "@/hooks/useCustomer";

interface UserProfileProps {
  memberLevel?: string;
}

export function UserProfile({
  memberLevel = "Gold Member",
}: UserProfileProps) {
  const t = useTranslate();
  const navigate = useNavigate();
  const { customer } = useCustomer();

  const handleEditClick = () => {
    navigate("/settings/profile");
  };

  return (
    <div className="px-5 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-2">
            {customer?.first_name || customer?.last_name ? 
              `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim() 
              : ''}
          </h2>
          <div className="flex items-center gap-2">
            {/* Member level content */}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          // className="main-btn !h-10"
          onClick={handleEditClick}
        >
          {t("Edit")}
        </Button>
      </div>
    </div>
  );
}
