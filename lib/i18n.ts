import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation files
import enTranslations from "../messages/en.json";
import urTranslations from "../messages/ur.json";

const resources = {
  en: {
    translation: enTranslations,
  },
  ur: {
    translation: urTranslations,
  },
};

// Only initialize if not already initialized
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // This is important for SSR
    },
  });
}

export default i18n;
