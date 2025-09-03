export const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'de', 'ja', 'zh'] as const;

export const LOCALE_MAPPING = {
    en: { label: 'English', native: 'English' },
    es: { label: 'Spanish', native: 'Español' },
    fr: { label: 'French', native: 'Français' },
    de: { label: 'German', native: 'Deutsch' },
    ja: { label: 'Japanese', native: '日本語' },
    zh: { label: 'Chinese', native: '中文' },
} as const;

export const FRANC_TO_LOCALE_MAP = {
    eng: 'en',
    spa: 'es',
    fra: 'fr',
    deu: 'de',
    jpn: 'ja',
    zho: 'zh',
} as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

// Helper function to get language options for selectors
export const getLanguageOptions = () => {
    return SUPPORTED_LOCALES.map((locale) => ({
        label: LOCALE_MAPPING[locale].native,
        value: locale,
    }));
};
