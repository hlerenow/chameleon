import en_US from './en_US.json';
import zh_CN from './zh_CN.json';

export const staticTextTranslations = {
  zh_CN,
  en_US,
};

const englishToChinese = Object.fromEntries(Object.entries(en_US).map(([chinese, english]) => [english, chinese]));

export function translateStaticText(value: string, language: string) {
  if (language === 'zh_CN') {
    return englishToChinese[value] ?? value;
  }

  const itemMatch = value.match(/^元素-(\d+)$/);
  if (itemMatch) {
    return `Item-${itemMatch[1]}`;
  }

  return staticTextTranslations.en_US[value as keyof typeof staticTextTranslations.en_US] ?? value;
}
