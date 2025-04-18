import { useTranslate } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import useConfig from "@/hooks/useConfig";
import { Languages } from "lucide-react";
import i18n from "i18next";
import { useEffect, useState } from "react";

const LanguageSwitcher = () => {
  const t = useTranslate();
  const { config, setConfig } = useConfig();
  const [currentLang, setCurrentLang] = useState(i18n.language || 'th');

  // Sync language on mount and when config changes
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') || 'th';
    if (savedLocale !== i18n.language) {
      i18n.changeLanguage(savedLocale);
      setCurrentLang(savedLocale);
    }

    // Ensure localStorage has a value
    if (!localStorage.getItem('locale')) {
      localStorage.setItem('locale', 'th');
    }
  }, []);

  // Update when config changes
  useEffect(() => {
    if (config.default_language && config.default_language !== currentLang) {
      setCurrentLang(config.default_language);
    }
  }, [config.default_language]);

  // Handling direct language selection
  const setLanguage = (lang: string) => {
    localStorage.setItem("locale", lang);
    i18n.changeLanguage(lang);
    setCurrentLang(lang);
    setConfig({ ...config, default_language: lang });
    
    // Force reload to apply all translations
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-4">
      <Button 
        size="sm" 
        variant={currentLang === 'en' ? "default" : "outline"} 
        onClick={() => setLanguage('en')}
      >
        English
      </Button>
      <Button 
        size="sm" 
        variant={currentLang === 'th' ? "default" : "outline"} 
        onClick={() => setLanguage('th')}
      >
        ไทย
      </Button>
    </div>
  );
};

export default LanguageSwitcher;
