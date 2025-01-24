import { useTranslate } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import useConfig from "@/hooks/useConfig";
import { Languages } from "lucide-react";

const LanguageSwitcher = () => {
  const t = useTranslate();
  const { config, setConfig } = useConfig();

  const toggleLanguage = () => {
    const newLang = config.default_language === "en" ? "th" : "en";
    localStorage.setItem("locale", newLang);
    setConfig({ ...config, default_language: newLang });
  };

  return (
    <Button
      variant="ghost"
      onClick={toggleLanguage}
      className="flex items-center gap-2 h-8 px-2 hover:bg-transparent"
    >
      <Languages className="w-5 h-5" />
      <span className="text-sm font-medium">
        {config.default_language === "en" ? "ไทย" : "English"}
      </span>
    </Button>
  );
};

export default LanguageSwitcher;
