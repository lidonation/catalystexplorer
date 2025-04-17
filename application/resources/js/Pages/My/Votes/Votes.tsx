import Title from '@/Components/atoms/Title';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import VoterHistoryTable from '../../Votes/Partials/VoterHistoryTable';
import MyLayout from '@/Pages/My/MyLayout';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import React, { useMemo, useEffect } from 'react';
import { FiltersProvider, useFilterContext } from '@/Context/FiltersContext';
import { PaginatedData } from '../../../../types/paginated-data';
import { SearchParams } from '../../../../types/search-params';
import { VoteEnums } from '@/enums/vote-search-enums';

// Define your VoterHistoryData type
import VoterHistoryData = App.DataTransferObjects.VoterHistoryData;

interface VoteHistoryProps {
    voterHistories?: PaginatedData<VoterHistoryData[]>;
    search?: string;
    secondarySearch?: string;
    sort?: string;
    filters?: SearchParams;
    unifiedSearch?: boolean;
}

const VotesComponent: React.FC<VoteHistoryProps> = (props) => {
    const { filters, setFilters } = useFilterContext();
    const { t } = useTranslation();
    const { voterHistories } = props;
    const { props: pageProps } = usePage();
    const isAuthenticated = pageProps.auth?.user;

    // Set unifiedSearch parameter on mount
    useEffect(() => {
        console.log('Search Params:', {
            query: searchParams,
            unifiedSearch: 'true',
            url: window.location.href
        });
        // We're using VoteEnums.QUERY for the unified search
        const url = new URL(window.location.href);
        url.searchParams.set('unifiedSearch', 'true');
        window.history.replaceState({}, '', url.toString());

        // Set unified search flag
        url.searchParams.set('unifiedSearch', 'true');

        // Update the URL without refreshing the page
        window.history.replaceState({}, '', url.toString());

        // Load any existing search params
        const searchQuery = url.searchParams.get(VoteEnums.QUERY);
        if (searchQuery) {
            setFilters({
                param: VoteEnums.QUERY,
                value: searchQuery,
                label: t('vote.search')
            });
        }

        // Load other filter params
        const fundParam = url.searchParams.get(VoteEnums.FUND);
        if (fundParam) {
            setFilters({
                param: VoteEnums.FUND,
                value: fundParam,
                label: t('proposals.filters.epoch')
            });
        }

        const choiceParam = url.searchParams.get(VoteEnums.CHOICE);
        if (choiceParam) {
            setFilters({
                param: VoteEnums.CHOICE,
                value: choiceParam,
                label: t('vote.choice')
            });
        }
    }, []);

    const searchParams = useMemo(() => {
        const paramsObj = {} as SearchParams;
        filters.forEach(filter => {
            if (filter.param && filter.value !== undefined) {
                paramsObj[filter.param] = filter.value;
            }
        });
        paramsObj['unifiedSearch'] = 'true';
        return paramsObj;
    }, [filters]);

    return (
        <>
            <Head title={t('votes')} />
            <div className="mx-auto">
                <div className="text-content">
                    {isAuthenticated ? (
                        <div className="container flex flex-col">
                            <div className='bg-background rounded-lg shadow-lg'>
                                <VoterHistoryTable
                                    voterHistories={voterHistories as PaginatedData<VoterHistoryData[]>}
                                    filters={searchParams}
                                    unifiedSearch={true}
                                    customTitle={t('votes')}
                                />
                            </div>
                        </div>
                    ) : (
                        <RecordsNotFound />
                    )}
                </div>
            </div>
        </>
    );
};

const Votes: React.FC<VoteHistoryProps> = (props) => {
    return (
        <MyLayout>
            <FiltersProvider
                defaultFilters={{} as SearchParams}
                routerOptions={{
                    only: ['voterHistories'],
                    preserveState: true,
                    preserveScroll: true
                }}
            >
                <VotesComponent {...props} />
            </FiltersProvider>
        </MyLayout>
    );
};

export default Votes;
