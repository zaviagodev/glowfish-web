import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  rightElement?: React.ReactNode;
  onBack?: () => void;
}

export function PageHeader({ title, rightElement, onBack }: PageHeaderProps) {
  const navigate = useNavigate();
  const handleNavigate = () => navigate(-1);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 px-5 flex items-center justify-between bg-background/80 backdrop-blur-xl border-b">
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-transparent -ml-2"
        onClick={onBack || handleNavigate}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <h1 className="text-title2 font-semibold tracking-tight">{title}</h1>
      {rightElement || <div className="w-10" />}
    </header>
  );
}
