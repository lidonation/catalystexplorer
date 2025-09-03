import { usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useState } from 'react';
import Selector from './atoms/Selector';

const LANGS = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'ja', label: '日本語' },
    { value: 'zh', label: '中文' },
];

export default function LangSwitcher() {
    const { currentLocale, setLocale } = useLaravelReactI18n();
    const { locale } = usePage().props as { locale?: string };

    const initialLang = typeof locale === 'string' ? locale : currentLocale();
    const [selectedLang, setSelectedLang] = useState<string>(initialLang);

    useEffect(() => {
        if (!selectedLang || typeof selectedLang !== 'string') return;
        if (currentLocale() === selectedLang) return;

        setLocale(selectedLang);

        const pathParts = window.location.pathname.split('/');
        pathParts[1] = selectedLang;
        const newPath = pathParts.join('/') || '/';

        window.history.pushState({}, '', newPath + window.location.search);
    }, [selectedLang]);

    const handleSelect = (lang: string) => {
        if (lang === selectedLang) return;
        setSelectedLang(lang);
    };

    return (
        <Selector
            options={LANGS}
            isMultiselect={false}
            context="language"
            selectedItems={selectedLang}
            setSelectedItems={handleSelect}
            placeholder="Select language"
            hideCheckbox
            triggerClassName="w-full"
        />
    );
}
