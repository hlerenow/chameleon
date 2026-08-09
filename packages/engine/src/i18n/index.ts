import i18n from 'i18next';
import type { Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import enUSResources from './en_US.json';
import zhCNResources from './zh_CN.json';

export const DEFAULT_LOCALE = 'zh_CN';
export const SUPPORTED_LOCALES = ['zh_CN', 'en_US'] as const;
export type EngineLocale = typeof SUPPORTED_LOCALES[number];

const resources: Resource = {
  zh_CN: {
    translation: zhCNResources,
  },
  en_US: {
    translation: enUSResources,
  },
};

export function normalizeLocale(locale?: string): EngineLocale {
  if (!locale) {
    return DEFAULT_LOCALE;
  }

  const normalizedLocale = locale.replace('-', '_');
  return SUPPORTED_LOCALES.includes(normalizedLocale as EngineLocale)
    ? (normalizedLocale as EngineLocale)
    : DEFAULT_LOCALE;
}

export function addI18nResources(extraResources?: Resource) {
  if (!extraResources) {
    return;
  }

  Object.entries(extraResources).forEach(([locale, namespaces]) => {
    Object.entries(namespaces).forEach(([namespace, resource]) => {
      i18n.addResourceBundle(normalizeLocale(locale), namespace, resource, true, true);
    });
  });
}

i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: SUPPORTED_LOCALES,
  interpolation: {
    escapeValue: false,
  },
  react: {
    bindI18n: 'added languageChanged',
    bindI18nStore: 'added',
  },
});

export type CustomI18n = typeof i18n & {
  update: () => void;
};

const customI18n: CustomI18n = i18n as any;

customI18n.update = () => {
  setTimeout(() => {
    i18n.emit('added');
  }, 0);
};

export function changeEngineLocale(locale?: string) {
  return customI18n.changeLanguage(normalizeLocale(locale));
}

export default customI18n;
