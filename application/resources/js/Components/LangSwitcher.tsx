import { router, usePage } from '@inertiajs/react';
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
    const { locale } = usePage().props as any;

    const [selectedLang, setSelectedLang] = useState(locale || currentLocale());

    useEffect(() => {
        if (!selectedLang) return;

        setLocale(selectedLang);

        const pathParts = window.location.pathname.split('/');
        pathParts[1] = selectedLang;
        pathParts[1] = selectedLang;
        const newPath = pathParts.join('/') || '/';

        window.history.pushState({}, '', newPath + window.location.search);
        router.reload();
    }, [selectedLang]);

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
