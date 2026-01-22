import { useLaravelReactI18n } from 'laravel-react-i18n';
import { CornerDownLeft } from 'lucide-react';
import Paragraph from '../atoms/Paragraph';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface SearchHintSectionProps {
    isVisible: boolean;
}

export default function SearchHintSection({
    isVisible,
}: SearchHintSectionProps) {
    const { t } = useLaravelReactI18n();
    const prefersReducedMotion = useReducedMotion();

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ 
                        opacity: 1, 
                        height: 'auto',
                        transition: {
                            duration: prefersReducedMotion ? 0.1 : 0.2,
                        }
                    }}
                    exit={{ 
                        opacity: 0, 
                        height: 0,
                        transition: {
                            duration: prefersReducedMotion ? 0.05 : 0.15,
                        }
                    }}
                    className="border-border-primary flex items-center gap-3 border-b px-4 py-3"
                    data-testid="global-search-hint-section"
                >
                    <CornerDownLeft className="text-gray-persist h-4 w-4 flex-shrink-0" />
                    <div className="flex flex-wrap items-center gap-1">
                        <Paragraph className="text-gray-persist text-sm">
                            {t('globalSearch.searchHint.pressEnter')}
                        </Paragraph>
                        <Paragraph className="text-content text-sm font-medium">
                            {t('globalSearch.searchHint.categories')}
                        </Paragraph>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                        <kbd className="bg-background-darker text-content rounded px-2 py-0.5 text-xs font-medium">
                            {t('globalSearch.searchHint.enterKey')}
                        </kbd>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
