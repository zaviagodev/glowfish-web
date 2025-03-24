import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title?: string;
  rightElement?: React.ReactNode;
  className?: string;
  onBack?: () => void;
}

export function PageHeader({
  title,
  rightElement,
  onBack,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate();
  const handleNavigate = () => navigate(-1);
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-14 px-5 grid grid-cols-4 items-center bg-background/80 backdrop-blur-xl border-b max-width-mobile",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-transparent -ml-2"
        onClick={onBack || handleNavigate}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <h1 className="text-base font-semibold tracking-tight text-center col-span-2">
        {title}
      </h1>
      {rightElement || <div className="w-10" />}
    </header>
  );
}
