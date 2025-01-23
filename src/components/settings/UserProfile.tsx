import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface UserProfileProps {
  fullName: string | undefined;
  memberLevel?: string;
}

export function UserProfile({ fullName, memberLevel = "Gold Member" }: UserProfileProps) {
  const t = useTranslate();
  const navigate = useNavigate();

  const handleEditClick = () => {
    navigate('/settings/profile');
  };

  return (
    <div className="px-4 py-6 border-b">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-2">
            {fullName || t("User")}
          </h2>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
              {t(memberLevel)}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-[#E5E5E5] hover:bg-[#F8F8F8]"
          onClick={handleEditClick}
        >
          {t("Edit")}
        </Button>
      </div>
    </div>
  );
}