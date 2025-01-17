import { Home, Calendar, Gift, User, History } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useTranslate } from "@refinedev/core";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const t = useTranslate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Calendar, label: "My Events", path: "/my-events" },
    { icon: Gift, label: "Rewards", path: "/rewards" },
    { icon: History, label: "History", path: "/history" },
    { icon: User, label: "Settings", path: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-[#282828]">
      <div className="flex justify-around items-center h-[70px] px-4">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className="flex flex-col items-center gap-1"
              aria-label={label}
            >
              <Icon 
                size={24} 
                className={cn(
                  "transition-colors duration-200",
                  isActive ? "text-mainorange" : "text-[#979797]"
                )}
              />
              <span 
                className={cn(
                  "text-xs font-medium transition-colors duration-200",
                  isActive ? "text-white" : "text-[#979797]"
                )}
              >
                {t(label)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;