import { useGlobalSearch } from '@/Context/GlobalSearchContext';
import { useRecentlyVisited } from '@/useHooks/useRecentlyVisited';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, Variants } from 'framer-motion';
import {
    Command,
    CommandInput,
    CommandList,
    CommandSeparator,
} from '@/Components/Command';
import {
    Dialog,
    DialogPortal,
    DialogTitle,
} from '@/Components/Dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import SearchResultsSection from './SearchResultsSection';
import PlacesSection from './PlacesSection';
import RecentlyVisitedSection from './RecentlyVisitedSection';
import NullStateSection from './NullStateSection';
import SearchHintSection from './SearchHintSection';
import { router, usePage } from '@inertiajs/react';
import { generateLocalizedRoute } from '@/utils/localizedRoute';

const MODAL_WIDTH = 600;
const MODAL_MOBILE_MARGIN = 16;
const MODAL_MAX_HEIGHT_VH = 85;

const MOBILE_BREAKPOINT = 1024;

export default function GlobalSearchModal() {
    const { t } = useLaravelReactI18n();
    const { isOpen, closeSearch, query, setQuery, triggerRect, updateTriggerRect } = useGlobalSearch();
    const { recentProposals, recentLists, isLoading } = useRecentlyVisited();
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const prefersReducedMotion = useReducedMotion();
    const commandListRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(
        typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
    );

    // Track viewport size for responsive modal width
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Calculate responsive modal width
    const modalWidth = useMemo(() => {
        if (typeof window === 'undefined') return MODAL_WIDTH;
        if (isMobile) {
            return window.innerWidth - (MODAL_MOBILE_MARGIN * 2);
        }
        return MODAL_WIDTH;
    }, [isMobile]);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        if (query.length > 0 && commandListRef.current) {
            commandListRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }, [query]);

    // Update trigger position on scroll/resize while modal is open
    useEffect(() => {
        if (!isOpen) return;

        const handleReposition = () => updateTriggerRect();
        window.addEventListener('resize', handleReposition);
        window.addEventListener('scroll', handleReposition, true);

        return () => {
            window.removeEventListener('resize', handleReposition);
            window.removeEventListener('scroll', handleReposition, true);
        };
    }, [isOpen, updateTriggerRect]);

    const handleSelect = useCallback(() => {
        closeSearch();
    }, [closeSearch]);

    const hasRecentItems = recentProposals.length > 0 || recentLists.length > 0;
    const showSearchResults = debouncedQuery.length >= 2;

    const modalPosition = useMemo(() => {
        if (!triggerRect) {
            if (isMobile) {
                return {
                    top: '10%',
                    left: MODAL_MOBILE_MARGIN,
                    x: 0,
                    width: modalWidth,
                };
            }
            return {
                top: '10%',
                left: '50%',
                x: 'calc(-50% + var(--sidebar-width, 0px) / 2)',
                width: modalWidth,
            };
        }

        return {
            top: triggerRect.top,
            left: triggerRect.left,
            x: 0,
            width: modalWidth,
            initialWidth: triggerRect.width,
            initialHeight: triggerRect.height,
        };
    }, [triggerRect, isMobile, modalWidth]);

    const overlayVariants = useMemo(() => ({
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: prefersReducedMotion ? 0.1 : 0.2 }
        },
        exit: {
            opacity: 0,
            transition: { duration: prefersReducedMotion ? 0.1 : 0.15 }
        },
    }), [prefersReducedMotion]);

    const modalVariants = useMemo((): Variants => {
      
        if (prefersReducedMotion) {
            return {
                hidden: { opacity: 0, scale: 1, y: 0, width: modalWidth, height: 'auto' },
                visible: { opacity: 1, scale: 1, y: 0, width: modalWidth, height: 'auto', transition: { duration: 0.15 } },
                exit: { opacity: 0, scale: 1, y: 0, width: modalWidth, transition: { duration: 0.1 } },
            };
        }

        if (triggerRect) {
            return {
                hidden: {
                    opacity: 0,
                    width: isMobile ? modalWidth : triggerRect.width,
                    height: triggerRect.height,
                    scale: 0.98,
                    y: 0,
                },
                visible: {
                    opacity: 1,
                    width: modalWidth,
                    height: 'auto',
                    scale: 1,
                    y: 0,
                    transition: {
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                        opacity: { duration: 0.15 },
                        width: { type: 'spring', stiffness: 300, damping: 25 },
                        height: { type: 'spring', stiffness: 300, damping: 25 },
                    },
                },
                exit: {
                    opacity: 0,
                    width: isMobile ? modalWidth : triggerRect.width,
                    scale: 0.98,
                    y: 0,
                    transition: {
                        duration: 0.2,
                        ease: 'easeOut',
                        opacity: { duration: 0.15 },
                    },
                },
            };
        }

        // Fallback: slide-down animation (no trigger - mobile or desktop)
        return {
            hidden: {
                opacity: 0,
                y: -20,
                scale: 0.95,
                width: modalWidth,
                height: 'auto',
            },
            visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                width: modalWidth,
                height: 'auto',
                transition: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                },
            },
            exit: {
                opacity: 0,
                y: -10,
                scale: 0.98,
                width: modalWidth,
                transition: {
                    duration: 0.2,
                    ease: 'easeOut',
                },
            },
        };
    }, [prefersReducedMotion, triggerRect, isMobile, modalWidth]);

    const handleEnterSearch = useCallback(() => {
        if (query.trim().length === 0) {
            return; 
        }

        closeSearch();
        const searchRoute = generateLocalizedRoute(
            'search.index'
        );
        router.visit(`${searchRoute}?q=${encodeURIComponent(query.trim())}`);
    }, [query, closeSearch]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key !== 'Enter') return;

        e.preventDefault();
        e.stopPropagation();
        handleEnterSearch();
    }, [handleEnterSearch]);

    // Compute style for positioning
    const modalStyle = useMemo(() => {
        if (!triggerRect) {
            return {
                top: modalPosition.top,
                left: modalPosition.left,
                transform: `translateX(${modalPosition.x})`,
                maxHeight: `${MODAL_MAX_HEIGHT_VH}vh`,
            };
        }

        return {
            top: triggerRect.top,
            left: triggerRect.left,
            maxHeight: `${MODAL_MAX_HEIGHT_VH}vh`,
        };
    }, [triggerRect, modalPosition]);

    // Handle viewport edge cases
    const adjustedStyle = useMemo(() => {
        if (typeof window === 'undefined') {
            return modalStyle;
        }

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // On mobile without trigger, use centered positioning
        if (isMobile && !triggerRect) {
            return {
                top: '10%',
                left: MODAL_MOBILE_MARGIN,
                width: modalWidth,
                maxHeight: `${MODAL_MAX_HEIGHT_VH}vh`,
            };
        }

        if (!triggerRect) {
            return modalStyle;
        }

        let adjustedLeft = triggerRect.left;
        let adjustedTop = triggerRect.top;

        // On mobile, center the modal horizontally but keep vertical position from trigger
        if (isMobile) {
            adjustedLeft = MODAL_MOBILE_MARGIN;
        } else {
            // Prevent modal from going off right edge (desktop)
            if (adjustedLeft + modalWidth > viewportWidth - 16) {
                adjustedLeft = Math.max(16, viewportWidth - modalWidth - 16);
            }
        }

        // Prevent modal from going off bottom edge
        const maxModalHeight = viewportHeight * (MODAL_MAX_HEIGHT_VH / 100);
        if (adjustedTop + maxModalHeight > viewportHeight - 16) {
            adjustedTop = Math.max(16, viewportHeight - maxModalHeight - 16);
        }

        return {
            ...modalStyle,
            top: adjustedTop,
            left: adjustedLeft,
        };
    }, [triggerRect, modalStyle, isMobile, modalWidth]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeSearch()}>
            <AnimatePresence>
                {isOpen && (
                    <DialogPortal forceMount>
                        {/* Animated Overlay */}
                        <motion.div
                            variants={overlayVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="fixed inset-0 z-50 bg-black/80"
                            onClick={closeSearch}
                            data-testid="global-search-overlay"
                        />

                        {/* Animated Modal Content */}
                        <DialogPrimitive.Content asChild forceMount>
                            <motion.div
                                variants={modalVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                style={adjustedStyle}
                                className="bg-background fixed z-50 overflow-hidden rounded-xl border shadow-2xl"
                                data-testid="global-search-modal"
                            >
                                <DialogTitle hidden>
                                    {t('globalSearch.search')}
                                </DialogTitle>
                                <div onKeyDown={handleKeyDown}>
                                    <Command
                                        className="[&_[cmdk-group-heading]]:text-primary [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-sm [&_[cmdk-group-heading]]:font-bold"
                                        shouldFilter={false}
                                    >
                                        <div className="border-border-primary flex items-center border-b px-3">
                                            <CommandInput
                                                placeholder={t('globalSearch.typeToSearch')}
                                                value={query}
                                                onValueChange={setQuery}
                                                className="border-0 focus:ring-0"
                                                data-testid="global-search-input"
                                                autoFocus
                                            />
                                        </div>

                                        <CommandList ref={commandListRef} className="max-h-[60vh] overflow-y-auto">
                                            <SearchHintSection
                                                isVisible={query.length >= 1}
                                            />
                                            {showSearchResults && (
                                                <>
                                                    <SearchResultsSection
                                                        query={debouncedQuery}
                                                        onSelect={handleSelect}
                                                    />
                                                    <CommandSeparator />
                                                </>
                                            )}

                                            <PlacesSection onSelect={handleSelect} />
                                            <CommandSeparator />

                                            {isLoading ? (
                                                <div className="text-gray-persist p-4 text-center text-sm">
                                                    {t('globalSearch.loading')}
                                                </div>
                                            ) : hasRecentItems ? (
                                                <RecentlyVisitedSection
                                                    recentProposals={recentProposals}
                                                    recentLists={recentLists}
                                                    onSelect={handleSelect}
                                                />
                                            ) : (
                                                <NullStateSection onSelect={handleSelect} />
                                            )}
                                        </CommandList>
                                    </Command>
                                </div>
                            </motion.div>
                        </DialogPrimitive.Content>
                    </DialogPortal>
                )}
            </AnimatePresence>
        </Dialog>
    );
}