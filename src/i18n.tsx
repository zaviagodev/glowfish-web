import i18n from "i18next";
import { initReactI18next } from "react-i18next";
// Import translations explicitly
import thTranslations from "./translations/th.json";
import enTranslations from "./translations/en.json";

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      th: {
        translation: thTranslations
      }
    },
    lng: localStorage.getItem("locale") || "th", // Default to Thai if no language is stored
    fallbackLng: "th", // Set Thai as fallback language
    interpolation: {
      escapeValue: false // React already escapes values
    },
    // Don't split keys with dots
    keySeparator: false,
    // Fall back to key name if translation not found
    returnNull: false,
    returnEmptyString: false,
    // Namespace separator (for nested objects)
    nsSeparator: false,
    // Show missing keys in console during development
    saveMissing: true,
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      console.warn(`Missing translation key: ${key} for language: ${lng}`);
    },
    debug: true, // Enable debug mode to see console logs
    react: {
      useSuspense: false // We don't want to use suspense for loading
    }
  });

export default i18n; 