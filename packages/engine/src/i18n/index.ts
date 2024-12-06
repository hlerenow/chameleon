import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { zh_CN } from './zh_CN';
import { en_US } from './en_US';

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  zh_CN,
  en_US,
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'zh_CN', // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option
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

customI18n.changeLanguage('en_US');

export default customI18n;
