import i18n from 'i18next';
export type CustomI18n = typeof i18n & {
    update: () => void;
};
declare const customI18n: CustomI18n;
export default customI18n;
