import { Home, Calendar, Gift, User, History } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useTranslate } from "@refinedev/core";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const t = useTranslate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/home") {
      return location.pathname === "/home" || location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Calendar, label: "Products", path: "/products" },
    { icon: Gift, label: "Rewards", path: "/rewards" },
    // { icon: History, label: "History", path: "/history" },
    { icon: User, label: "Me", path: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-[50%] translate-x-[-50%] w-full max-w-[600px] z-50 bg-background/80 backdrop-blur-xl border-t">
      <div className="flex justify-around items-center h-[49px]">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = isActive(path);
          return (
            <Link
              key={path}
              to={path}
              className="flex flex-col items-center gap-0.5 w-[20%] no-underline"
              aria-label={label}
            >
              <Icon
                size={17}
                className={cn(
                  "transition-colors duration-200 hover:text-primary",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "text-[9px] font-medium transition-colors duration-200 no-underline",
                  active ? "text-primary" : "text-muted-foreground"
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
