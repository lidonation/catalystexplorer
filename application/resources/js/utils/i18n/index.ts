// import enLang from '@/utils/i18n/locale/en/en.json';
// import frLang from '@/utils/i18n/locale/fr/fr.json';
// import i18n from 'i18next';
// import { initReactI18next } from 'react-i18next';
//
// let currentLocale = 'en';
//
// if (typeof window != 'undefined') {
//     currentLocale = document.documentElement.lang
// }
//
//
// // the translations
// // (tip move them in a JSON file and import them,
// // or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
// const resources = {
//     en: {
//         translation: enLang,
//     },
//     fr: {
//         translation: frLang,
//     },
// };
//
// i18n.use(initReactI18next) // passes i18n down to react-i18next
//     .init({
//         resources,
//         fallbackLng: currentLocale,
//         lng: currentLocale,
//
//         interpolation: {
//             escapeValue: false, // react already safes from xss
//         },
//     });
//
// export default i18n;
