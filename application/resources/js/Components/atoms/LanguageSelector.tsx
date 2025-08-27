import { getLanguageOptions } from '@/constants/locales';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React from 'react';
import Selector from './Selector';

interface LanguageSelectorProps {
    selectedLanguage: string;
    onLanguageChange: (locale: string) => void;
    className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
    selectedLanguage,
    onLanguageChange,
    className = '',
}) => {
    const { t } = useLaravelReactI18n();

    // Use centralized language options
    const languageOptions = getLanguageOptions();

    return (
        <div className={className}>
            <label className="text-content text-sm">
                {t('selectLanguage')}
            </label>
            <Selector
                selectedItems={selectedLanguage}
                setSelectedItems={onLanguageChange}
                options={languageOptions}
                placeholder={t('selectLanguageForContent')}
                hideCheckbox={true}
                triggerClassName="border border-gray-persist/[0.4]"
                data-testid="language-selector"
            />
        </div>
    );
};

export default LanguageSelector;
