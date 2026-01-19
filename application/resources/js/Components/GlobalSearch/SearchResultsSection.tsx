import { CommandGroup, CommandItem, CommandSeparator } from '@/Components/Command';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { router, usePage } from '@inertiajs/react';
import { ExternalLink, FileText, List, Loader2, Search } from 'lucide-react';
import { useQuickSearch } from '@/useHooks/useQuickSearch';
import Paragraph from '../atoms/Paragraph';
import PrimaryButton from '../atoms/PrimaryButton';
import { AnimatePresence, motion, useReducedMotion, Variants } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

interface SearchResultsSectionProps {
    query: string;
    onSelect: () => void;
}

export default function SearchResultsSection({
    query,
    onSelect,
}: SearchResultsSectionProps) {
    const { t } = useLaravelReactI18n();
    const { results, isLoading, error } = useQuickSearch(query);
    const { locale } = usePage().props as { locale?: string };
    const resolvedLocale = locale || 'en';
    const prefersReducedMotion = useReducedMotion();
    const [hasSearchedOnce, setHasSearchedOnce] = useState(false);

    // Track previous results for smooth transitions
    const previousResultsRef = useRef(results);
    useEffect(() => {
        previousResultsRef.current = results;
    }, [results]);
    const previousResults = previousResultsRef.current;

    useEffect(() => {
        if (results && !hasSearchedOnce) {
            setHasSearchedOnce(true);
        }
    }, [results, hasSearchedOnce]);

    const displayResults = isLoading && hasSearchedOnce
        ? previousResults
        : results;

    // Animation variants - simplified for reduced motion
    const containerVariants = useMemo(() => ({
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: prefersReducedMotion
                ? { duration: 0.15 }
                : { staggerChildren: 0.04, delayChildren: 0.05 },
        },
    }), [prefersReducedMotion]);

    const itemVariants = useMemo((): Variants => {
        if (prefersReducedMotion) {
            return {
                hidden: { opacity: 0, y: 0 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.1 } },
            };
        }
        return {
            hidden: { opacity: 0, y: 8 },
            visible: {
                opacity: 1,
                y: 0,
                transition: {
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                },
            },
        };
    }, [prefersReducedMotion]);

    const loadingVariants = useMemo(() => ({
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.15 } },
    }), []);

    const handleProposalClick = (proposal: { id: string; slug: string }) => {
        onSelect();
        const proposalRoute = generateLocalizedRoute(
            'proposals.proposal.details',
            { slug: proposal.slug },
        );
        router.visit(proposalRoute);
    };

    const handleListClick = (list: { id: string }) => {
        onSelect();
        const listRoute = generateLocalizedRoute(
            'lists.view',
            { bookmarkCollection: list.id },
        );
        router.visit(listRoute);
    };

    const handleViewAll = () => {
        onSelect();
        const searchRoute = generateLocalizedRoute(
            'search.index',
            undefined,
            resolvedLocale,
        );
        router.visit(`${searchRoute}?q=${encodeURIComponent(query)}`);
    };

    useEffect(() => {
        if (query.length === 0) {
            setHasSearchedOnce(false);
        }
    }, [query]);

    // Loading state with animation
    if (isLoading && !hasSearchedOnce) {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key="loading"
                    variants={loadingVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex items-center justify-center py-8"
                >
                    <Loader2 className="text-primary h-6 w-6 animate-spin" />
                </motion.div>
            </AnimatePresence>
        );
    }

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-error px-3 py-4 text-center text-sm"
            >
                {t('globalSearch.searchError')}
            </motion.div>
        );
    }

    const hasResults =
        (displayResults?.proposals?.length ?? 0) > 0 ||
        (displayResults?.lists?.length ?? 0) > 0;

    if (!hasResults) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="px-3 py-8 text-center"
            >
                <Search className="text-gray-persist mx-auto mb-2 h-8 w-8 opacity-50" />
                <Paragraph className="text-gray-persist text-sm">
                    {t('globalSearch.noResultsFor', { query })}
                </Paragraph>
                <PrimaryButton
                    onClick={handleViewAll}
                    className="text-primary mt-2 bg-transparent text-sm hover:underline"
                >
                    {t('globalSearch.searchAllCategories')}
                </PrimaryButton>
            </motion.div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={`results-${query}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Proposals Section */}
                {displayResults?.proposals && displayResults.proposals.length > 0 && (
                    <CommandGroup
                        heading={t('globalSearch.sections.proposals')}
                        className="[&_[cmdk-group-heading]]:text-primary [&_[cmdk-group-heading]]:text-sm"
                    >
                        {displayResults.proposals.map((proposal) => (
                            <motion.div
                                key={`search-proposal-${proposal.id}`}
                                layout
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{
                                    layout: { type: 'spring', stiffness: 500, damping: 30 }
                                }}
                            >
                                <CommandItem
                                    value={`search-proposal-${proposal.id}`}
                                    onSelect={() => handleProposalClick(proposal)}
                                    className="flex cursor-pointer items-center gap-3 px-3 py-2"
                                    data-testid={`global-search-result-proposal-${proposal.id}`}
                                >
                                    <FileText className="text-gray-persist h-4 w-4 shrink-0" />
                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <Paragraph className="text-content truncate text-sm font-medium">
                                            {proposal.title}
                                        </Paragraph>
                                        <div className="flex items-center gap-2">
                                            {proposal.fund_label && (
                                                <Paragraph className="text-gray-persist text-xs">
                                                    {proposal.fund_label}
                                                </Paragraph>
                                            )}
                                            {proposal.amount_requested && (
                                                <Paragraph className="text-gray-persist text-xs">
                                                    • {proposal.currency === 'USD' ? '$' : '₳'}{Number(proposal.amount_requested).toLocaleString()}
                                                </Paragraph>
                                            )}
                                        </div>
                                    </div>
                                </CommandItem>
                            </motion.div>
                        ))}
                    </CommandGroup>
                )}

                {(displayResults?.proposals?.length ?? 0) > 0 && (displayResults?.lists?.length ?? 0) > 0 && (
                    <CommandSeparator />
                )}

                {/* Lists Section */}
                {displayResults?.lists && displayResults.lists.length > 0 && (
                    <CommandGroup
                        heading={t('globalSearch.sections.lists')}
                        className="[&_[cmdk-group-heading]]:text-primary [&_[cmdk-group-heading]]:text-sm"
                    >
                        {displayResults.lists.map((list) => (
                            <motion.div
                                key={`search-list-${list.id}`}
                                variants={itemVariants}
                            >
                                <CommandItem
                                    value={`search-list-${list.id}`}
                                    onSelect={() => handleListClick(list)}
                                    className="flex cursor-pointer items-center gap-3 px-3 py-2"
                                    data-testid={`global-search-result-list-${list.id}`}
                                >
                                    <List className="text-content h-4 w-4 shrink-0" />
                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <Paragraph className="text-content truncate text-sm font-medium">
                                            {list.title}
                                        </Paragraph>
                                        {list.items_count !== undefined && (
                                            <Paragraph className="text-content text-xs">
                                                {t('globalSearch.itemsCount', { count: list.items_count })}
                                            </Paragraph>
                                        )}
                                    </div>
                                </CommandItem>
                            </motion.div>
                        ))}
                    </CommandGroup>
                )}

                <CommandSeparator />

                {/* View All Results */}
                <CommandGroup className="[&_[cmdk-group-heading]]:text-primary [&_[cmdk-group-heading]]:text-sm">
                    <motion.div variants={itemVariants}>
                        <CommandItem
                            value="view-all-results"
                            onSelect={handleViewAll}
                            className="flex cursor-pointer items-center justify-between px-3 py-2"
                            data-testid="global-search-view-all"
                        >
                            <Paragraph className="text-primary text-sm font-medium">
                                {t('globalSearch.viewAllResults')}
                            </Paragraph>
                            <ExternalLink className="text-primary h-4 w-4" />
                        </CommandItem>
                    </motion.div>
                </CommandGroup>
            </motion.div>
        </AnimatePresence>
    );
}
