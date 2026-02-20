import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import es from './es.json';

const STORAGE_KEY = 'la-soberana-lang';

export const defaultNS = 'common';
export const supportedLngs = ['en', 'es'];

const savedLanguage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && supportedLngs.includes(stored)) return stored;
  } catch (_) {}
  return 'en';
};

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, es: { translation: es } },
  lng: savedLanguage(),
  fallbackLng: 'en',
  supportedLngs,
  defaultNS: 'translation',
  interpolation: { escapeValue: false },
});

/**
 * Persist language selection to localStorage.
 * @param {string} lng - Language code (e.g. 'en', 'es')
 */
export function setStoredLanguage(lng) {
  if (supportedLngs.includes(lng)) {
    try {
      localStorage.setItem(STORAGE_KEY, lng);
    } catch (_) {}
    i18n.changeLanguage(lng);
  }
}

export { STORAGE_KEY };
export default i18n;
