import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useState } from 'react';
import Selector from './atoms/Selector';

const LANGS = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' },
    { value: 'pt', label: 'Português' },
    { value: 'ru', label: 'Русский' },
    { value: 'zh', label: '中文' },
];

export default function LangSwitcher() {
    const { currentLocale, setLocale } = useLaravelReactI18n();

    // Get initial locale from URL if available
    const getInitialLocale = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('lang') || currentLocale();
    };

    const [selectedLang, setSelectedLang] = useState(getInitialLocale);

    useEffect(() => {
        if (!selectedLang) return;

        // Update i18n locale
        setLocale(selectedLang);

        const pathParts = window.location.pathname.split('/');
        pathParts[1] = selectedLang; // replace locale
        const newPath = pathParts.join('/') || '/';

        // Push new URL into history without reload
        window.history.pushState({}, '', newPath + window.location.search);
    }, [selectedLang, setLocale]);


    return (
        <Selector
            options={LANGS}
            isMultiselect={false}
            context="language"
            selectedItems={selectedLang}
            setSelectedItems={setSelectedLang}
            placeholder="Select language"
            hideCheckbox
            triggerClassName="w-full"
        />
    );
}
