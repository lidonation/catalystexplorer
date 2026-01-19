import { useGlobalSearch } from '@/Context/GlobalSearchContext';
import { useRecentlyVisited } from '@/useHooks/useRecentlyVisited';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useCallback, useEffect, useState } from 'react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/Components/Command';
import { Dialog, DialogContent, DialogTitle } from '@/Components/Dialog';
import SearchResultsSection from './SearchResultsSection';
import PlacesSection from './PlacesSection';
import RecentlyVisitedSection from './RecentlyVisitedSection';
import NullStateSection from './NullStateSection';


export default function GlobalSearchModal() {
    const { t } = useLaravelReactI18n();
    const { isOpen, closeSearch, query, setQuery } = useGlobalSearch();
    const { recentProposals, recentLists, isLoading } = useRecentlyVisited();
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = useCallback(() => {
        closeSearch();
    }, [closeSearch]);

    const hasRecentItems = recentProposals.length > 0 || recentLists.length > 0;
    const showSearchResults = debouncedQuery.length >= 2;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeSearch()}>
            <DialogTitle hidden> {t('globalSearch.search')} </DialogTitle>
            <DialogContent className="bg-background max-h-[85vh] overflow-hidden p-0 sm:max-w-[600px]">
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
                        />
                    </div>

                    <CommandList className="max-h-[60vh] overflow-y-auto">
                        {showSearchResults ? (
                            <SearchResultsSection
                                query={debouncedQuery}
                                onSelect={handleSelect}
                            />
                        ) : (
                            <>
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
                            </>
                        )}
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    );
}