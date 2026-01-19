import { useGlobalSearch } from '@/Context/GlobalSearchContext';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Search } from 'lucide-react';
import Paragraph from '../atoms/Paragraph';
import PrimaryButton from '../atoms/PrimaryButton';
import { useCallback, useEffect, useRef, useState } from 'react';

interface GlobalSearchTriggerProps {
    className?: string;
    variant?: 'content' | 'minimal';
    registerForAnimation?: boolean;
    fullWidth?: boolean;
}

const isElementVisible = (element: HTMLElement): boolean => {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null;
};

export default function GlobalSearchTrigger({
    variant = 'content',
    className = '',
    registerForAnimation,
    fullWidth = true,
}: GlobalSearchTriggerProps) {
    const { t } = useLaravelReactI18n();
    const { openSearch, registerTrigger, updateTriggerRect } = useGlobalSearch();
    const elementRef = useRef<HTMLElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    const shouldRegister = registerForAnimation ?? true;

    // Check visibility on mount and resize
    useEffect(() => {
        const checkVisibility = () => {
            if (elementRef.current) {
                const visible = isElementVisible(elementRef.current);
                setIsVisible(visible);
            }
        };

        checkVisibility();
        window.addEventListener('resize', checkVisibility);
        
        return () => window.removeEventListener('resize', checkVisibility);
    }, []);

    // Register/unregister based on visibility
    useEffect(() => {
        if (!shouldRegister) return;

        if (isVisible && elementRef.current) {
            registerTrigger(elementRef.current);
        } else {
            registerTrigger(null);
        }
    }, [isVisible, shouldRegister, registerTrigger]);

    const triggerRef = useCallback((element: HTMLElement | null) => {
        elementRef.current = element;
        if (!element) {
            setIsVisible(false);
            registerTrigger(null);
            return;
        }

        const visible = isElementVisible(element);
        setIsVisible(visible);
        if (shouldRegister && visible) {
            registerTrigger(element);
        }
    }, [shouldRegister, registerTrigger]);

    // Update trigger rect on window resize
    useEffect(() => {
        if (!shouldRegister || !isVisible) return;

        const handleResize = () => updateTriggerRect();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, [shouldRegister, isVisible, updateTriggerRect]);

    if (variant === 'minimal') {
        return (
            <PrimaryButton
                onClick={openSearch}
                ref={triggerRef}
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
            ref={triggerRef}
            className={`bg-background hover:bg-background-darker border-border-secondary flex ${fullWidth ? 'w-full' : ''} justify-start gap-3 rounded-xl border px-4 py-2.5 transition-colors ${className}`}
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
