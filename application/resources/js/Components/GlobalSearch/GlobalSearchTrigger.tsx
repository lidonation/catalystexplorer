import { useGlobalSearch } from '@/Context/GlobalSearchContext';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Search } from 'lucide-react';
import Paragraph from '../atoms/Paragraph';
import PrimaryButton from '../atoms/PrimaryButton';

interface GlobalSearchTriggerProps {
    className?: string;
    variant?: 'content' | 'minimal';
}

export default function GlobalSearchTrigger({
    variant = 'content',
    className = '',
}: GlobalSearchTriggerProps) {
    const { t } = useLaravelReactI18n();
    const { openSearch } = useGlobalSearch();

    if (variant === 'minimal') {
        return (
            <PrimaryButton
                onClick={openSearch}
                className={`hover:text-content p-2 bg-transparent ${className}`}
                aria-label={t('globalSearch.openSearch')}
                data-testid="global-search-trigger-minimal"
            >
                <Search className="h-5 w-5 text-gray-persist" />
            </PrimaryButton>
        );
    }

    return (
        <PrimaryButton
            onClick={openSearch}
            className={`bg-background hover:bg-background-darker border-border-secondary flex w-full justify-start gap-3 rounded-xl border px-4 py-2.5 transition-colors ${className}`}
            aria-label={t('globalSearch.openSearch')}
            data-testid="global-search-trigger-content"
        >
            <Search className="text-gray-persist h-5 w-5 flex-shrink-0" />
            <Paragraph className="text-gray-persist text-sm">
                {t('globalSearch.searchPlaceholder')}
            </Paragraph>
        </PrimaryButton>
    );

}
