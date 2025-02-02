import { useTranslate, useLogout } from "@refinedev/core"; 
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"; 
import { getUserProfile } from "@/lib/auth";
import { UserProfile } from "@/components/settings/UserProfile";
import { OrderStatusBar } from "@/components/settings/OrderStatusBar";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { WalletSection } from "@/components/settings/WalletSection";
import LanguageSwitcher from "@/components/language-switcher";

const SettingsPage = () => {
  const t = useTranslate();
  const { mutate: logout } = useLogout();
  const [userProfile, setUserProfile] = useState<{
    full_name: string;
    tier_id?: string;
  } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getUserProfile();
      if (profile) {
        setUserProfile(profile);
      }
    };
    loadProfile();
  }, []);

  const sections = [
    {
      title: t("Account"),
      items: [
        {
          icon: "👤",
          label: t("Profile"),
          path: "/settings/profile",
          showArrow: true
        }
      ]
    },
    {
      title: t("Points & Rewards"),
      items: [
        {
          icon: "⭐️",
          label: t("How to Get Points"),
          path: "/settings/how-to-get-points",
          showArrow: true
        },
        {
          icon: "🎁",
          label: t("How to Spend Points"),
          path: "/settings/how-to-spend-points",
          showArrow: true
        },
        {
          icon: "👑",
          label: t("Member Level"),
          path: "/settings/member-level",
          showArrow: true
        }
      ]
    },
  ];


  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <UserProfile fullName={userProfile?.full_name} />
      </div>

      {/* Main Content */}
      <div className="pt-[100px] pb-32">
        <OrderStatusBar />
        <WalletSection />
        {sections.map((section, index) => (
          <SettingsSection
            key={section.title}
            title={section.title}
            items={section.items}
            index={index}
          />
        ))}

        {/* Logout Button */}
        <div className="px-4">
          <Button
            variant="destructive"
            className="w-full h-12"
            onClick={() => logout()}
          >
            {t("Logout")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;