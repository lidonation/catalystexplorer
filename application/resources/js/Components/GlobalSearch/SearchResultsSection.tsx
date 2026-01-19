import { CommandGroup, CommandItem, CommandSeparator } from '@/Components/Command';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { router, Link, usePage } from '@inertiajs/react';
import { ExternalLink, FileText, List, Loader2, Search } from 'lucide-react';
import { useQuickSearch } from '@/useHooks/useQuickSearch';
import Paragraph from '../atoms/Paragraph';
import PrimaryButton from '../atoms/PrimaryButton';

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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="text-primary h-6 w-6 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-error px-3 py-4 text-center text-sm">
                {t('globalSearch.searchError')}
            </div>
        );
    }

    const hasResults =
        (results?.proposals?.length ?? 0) > 0 ||
        (results?.lists?.length ?? 0) > 0;

    if (!hasResults) {
        return (
            <div className= "px-3 py-8 text-center">
                <Search className="mx-auto mb-2 h-8 w-8 opacity-50 text-gray-persist" />
                <Paragraph className='text-sm text-gray-persist'>{t('globalSearch.noResultsFor', { query })}</Paragraph>
                <PrimaryButton
                    onClick={handleViewAll}
                    className="text-primary mt-2 text-sm hover:underline bg-transparent"
                >
                    {t('globalSearch.searchAllCategories')}
                </PrimaryButton>
            </div>
        );
    }

    return (
        <>
            {results?.proposals && results.proposals.length > 0 && (
                <CommandGroup
                    heading={t('globalSearch.sections.proposals')}
                    className="[&_[cmdk-group-heading]]:text-primary [&_[cmdk-group-heading]]:text-sm"
                >
                    {results.proposals.map((proposal) => (
                        <CommandItem
                            key={`search-proposal-${proposal.id}`}
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
                                {proposal.fund_label && (
                                    <Paragraph className="text-gray-persist text-xs">
                                        {proposal.fund_label}
                                    </Paragraph>
                                )}
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>
            )}

            {(results?.proposals?.length ?? 0) > 0 && (results?.lists?.length ?? 0) > 0 && (
                <CommandSeparator />
            )}

            {results?.lists && results.lists.length > 0 && (
                <CommandGroup
                    heading={t('globalSearch.sections.lists')}
                    className="[&_[cmdk-group-heading]]:text-primary [&_[cmdk-group-heading]]:text-sm"
                >
                    {results.lists.map((list) => (
                        <CommandItem
                            key={`search-list-${list.id}`}
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
                    ))}
                </CommandGroup>
            )}

            <CommandSeparator />

            <CommandGroup className="[&_[cmdk-group-heading]]:text-primary [&_[cmdk-group-heading]]:text-sm">
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
            </CommandGroup>
        </>
    );
}