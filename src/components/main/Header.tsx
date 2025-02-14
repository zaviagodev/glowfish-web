import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeaderProps } from "@/type/type";
import { useBack } from "@refinedev/core";

const Header = ({
  title,
  leftButton,
  rightButton,
  backButtonClassName,
  onClickBackButton,
  onClickRightButton,
  className,
}: HeaderProps) => {
  const back = useBack();

  return (
    <header
      className={cn(
        "px-4 py-3 fixed top-0 left-[50%] translate-x-[-50%] w-full max-w-[500px] h-14 z-50 flex items-center justify-between bg-background border-b border-border",
        className
      )}
    >
      <div className="flex items-center gap-5">
        <button
          onClick={() => (onClickBackButton ? onClickBackButton() : back())}
          className={cn(
            "text-muted-foreground hover:text-foreground transition-colors",
            backButtonClassName
          )}
        >
          {leftButton || <ChevronLeft />}
        </button>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      <button
        onClick={onClickRightButton}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {rightButton}
      </button>
    </header>
  );
};

export default Header;
