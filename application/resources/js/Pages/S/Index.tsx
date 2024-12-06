import {
    SearchResultCounts,
    SearchResultData,
    TabConfig,
} from '@/types/search';
import { TabGroup, TabPanel, TabPanels } from '@headlessui/react';
import { Head, WhenVisible } from '@inertiajs/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DynamicSearchResults from './Partials/DynamicSearchResults';
import ResultTabs from './Partials/ResultTabs';
import SearchResultsLoading from './Partials/SearchResultsLoading';

interface SearchResultsProps extends SearchResultData {
    counts: SearchResultCounts;
}

export const TAB_CONFIG: TabConfig[] = [];

const SearchResults = ({ counts, ...results }: SearchResultsProps) => {
    const search = window.location.search;
    const { t } = useTranslation();
    const params = new URLSearchParams(search);
    const query = params.get('q');
    const filters = params.get('f');
    const possibleFilters = filters
        ? filters.split(',')
        : Object.keys(t('searchResults.tabs', { returnObjects: true }));

    useEffect(() => {
        TAB_CONFIG.length = 0;
        possibleFilters.forEach((filter) => {
            TAB_CONFIG.push({
                name: filter as keyof SearchResultData,
                label:
                    t(`searchResults.tabs.${filter}`).charAt(0).toUpperCase() +
                    t(`searchResults.tabs.${filter}`).slice(1),
            });
        });
    }, [filters]);

    return (
        <>
            <Head title="Search Results" />
            <div className="container min-h-screen py-4">
                <div className="flex w-full flex-col">
                    <h1 className="title-3">
                        {t('searchResults.results.title', { query })}
                    </h1>
                </div>

                <TabGroup>
                    <ResultTabs counts={counts} tabConfig={TAB_CONFIG} />
                    <TabPanels>
                        {TAB_CONFIG.map((tab) => (
                            <TabPanel key={tab.name}>
                                <WhenVisible
                                    data={tab.name}
                                    fallback={
                                        <SearchResultsLoading
                                            type={tab.name}
                                            count={5}
                                        />
                                    }
                                >
                                    <div className="flex flex-col gap-2">
                                        <DynamicSearchResults
                                            name={tab.name}
                                            data={results[tab.name] as any}
                                        />
                                    </div>
                                </WhenVisible>
                            </TabPanel>
                        ))}
                    </TabPanels>
                </TabGroup>
            </div>
        </>
    );
};

export default SearchResults;
