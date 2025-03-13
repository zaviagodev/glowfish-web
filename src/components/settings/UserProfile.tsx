import { useTranslate } from "@refinedev/core";
import { useCustomer } from "@/hooks/useCustomer";

interface UserProfileProps {
  memberLevel?: string;
}

export function UserProfile({ memberLevel = "Gold Member" }: UserProfileProps) {
  const t = useTranslate();
  const { customer } = useCustomer();

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">
        {/* {customer?.first_name || customer?.last_name
          ? `${customer?.first_name || ""} ${
              customer?.last_name || ""
            }`.trim()
          : ""} */}
        {customer?.first_name || "User"}
      </h2>
      <div className="flex items-center gap-2">
        {/* Member level content */}
      </div>
    </div>
  );
}
