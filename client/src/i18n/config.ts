import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import en from "./en";
import fr from "./fr";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    detection: {
      order: ['navigator'],
      caches: []
    },
    fallbackLng: "en",
    resources: { en, fr },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
