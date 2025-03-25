import { useTranslate, useLogout } from "@refinedev/core";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getUserProfile } from "@/lib/auth";
import { UserProfile } from "@/components/settings/UserProfile";
import { OrderStatusBar } from "@/components/settings/OrderStatusBar";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { WalletSection } from "@/components/settings/WalletSection";
import { User } from "lucide-react";
import DrawerInfo from "@/components/company-info/DrawerInfo";

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
          icon: <User className="h-5 w-5" />,
          label: t("Profile"),
          path: "/profile",
          showArrow: true,
          color: "#4CAF50", // Green
          bgColor: "rgba(76, 175, 80, 0.1)",
        },
      ],
    },
    // {
    //   title: t("Points & Rewards"),
    //   items: [
    //     // {
    //     //   icon: <QrCode className="h-5 w-5" />,
    //     //   label: t("Scan to Redeem"),
    //     //   path: "/scan",
    //     //   showArrow: true,
    //     //   color: "#2196F3", // Blue
    //     //   bgColor: "rgba(33, 150, 243, 0.1)",
    //     // },
    //     {
    //       icon: <Star className="h-5 w-5" />,
    //       label: t("How to Get Points"),
    //       path: "/info/how-to-get-points",
    //       showArrow: true,
    //       color: "#fcc800", // Yellow
    //       bgColor: "rgba(252, 200, 0, 0.1)",
    //     },
    //     // {
    //     //   icon: <Gift className="h-5 w-5" />,
    //     //   label: t("How to Spend Points"),
    //     //   path: "/info/how-to-spend-points",
    //     //   showArrow: true,
    //     //   color: "#F44336", // Red
    //     //   bgColor: "rgba(244, 67, 54, 0.1)",
    //     // },
    //     // {
    //     //   icon: <Crown className="h-5 w-5" />,
    //     //   label: t("Member Level"),
    //     //   path: "/info/member-level",
    //     //   showArrow: true,
    //     //   color: "#FF9800", // Orange
    //     //   bgColor: "rgba(255, 152, 0, 0.1)",
    //     // },
    //   ],
    // },
  ];

  return (
    <div className="bg-background">
      {/* Fixed Header */}
      <div className="fixed flex items-center justify-between top-0 left-0 right-0 z-50 bg-background border-b max-width-mobile px-5 py-4">
        <UserProfile memberLevel={userProfile?.tier_id} />
      </div>

      {/* Main Content */}
      <div className="pt-16 pb-4">
        <WalletSection />
        <OrderStatusBar />
        {sections.map((section, index) => (
          <SettingsSection
            key={section.title}
            title={section.title}
            items={section.items}
            index={index}
          />
        ))}
        <div className="space-y-4">
          <DrawerInfo />
          {/* Logout Button */}
          <div className="px-5">
            <Button className="main-btn w-full" onClick={() => logout()}>
              {t("Logout")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
