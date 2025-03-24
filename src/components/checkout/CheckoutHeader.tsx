import { ChevronLeft } from "lucide-react";
import { useTranslate } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function CheckoutHeader() {
  const t = useTranslate();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 px-4 flex items-center justify-between bg-background/80 backdrop-blur-xl border-b">
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-transparent -ml-2"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <h1 className="text-base font-semibold tracking-tight">
        {t("Checkout")}
      </h1>
      <div className="w-10" />
    </header>
  );
}
