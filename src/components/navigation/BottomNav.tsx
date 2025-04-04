import { Home, Calendar, Gift, User, Ticket, Piano } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useTranslate } from "@refinedev/core";
import { cn } from "@/lib/utils";

export const navItems = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Piano, label: "Events", path: "/events" },
  { icon: Calendar, label: "Products", path: "/products" },
  { icon: Ticket, label: "Tickets", path: "/tickets" },
  { icon: Gift, label: "Rewards", path: "/rewards" },
  { icon: User, label: "Me", path: "/settings" },
];

const BottomNav = () => {
  const t = useTranslate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/home") {
      return location.pathname === "/home" || location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 w-full z-[49] bg-background/80 backdrop-blur-xl border-t max-width-mobile">
      <div className="flex justify-around items-center h-[60px]">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = isActive(path);
          return (
            <Link
              key={label}
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
                  "text-xs font-medium transition-colors duration-200 no-underline",
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
