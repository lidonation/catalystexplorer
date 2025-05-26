import { FiltersProvider, useFilterContext } from '@/Context/FiltersContext';
import { VoteEnums } from '@/enums/vote-search-enums';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import MyLayout from '@/Pages/My/MyLayout';
import { Head, usePage } from '@inertiajs/react';
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../types/paginated-data';
import { SearchParams } from '../../../types/search-params';
import VoterHistoryTable from '../../Votes/Partials/VoterHistoryTable';

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

    useEffect(() => {
        const url = new URL(window.location.href);
        url.searchParams.set('unifiedSearch', 'true');
        window.history.replaceState({}, '', url.toString());

        url.searchParams.set('unifiedSearch', 'true');

        window.history.replaceState({}, '', url.toString());

        const searchQuery = url.searchParams.get(VoteEnums.QUERY);
        if (searchQuery) {
            setFilters({
                param: VoteEnums.QUERY,
                value: searchQuery,
                label: t('vote.search'),
            });
        }

        const fundParam = url.searchParams.get(VoteEnums.FUND);
        if (fundParam) {
            setFilters({
                param: VoteEnums.FUND,
                value: fundParam,
                label: t('proposals.filters.epoch'),
            });
        }

        const choiceParam = url.searchParams.get(VoteEnums.CHOICE);
        if (choiceParam) {
            setFilters({
                param: VoteEnums.CHOICE,
                value: choiceParam,
                label: t('vote.choice'),
            });
        }
    }, []);

    const searchParams = useMemo(() => {
        const paramsObj = {} as SearchParams;
        filters.forEach((filter) => {
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
            <div className="mx-auto py-8">
                <div className="text-content">
                    {isAuthenticated ? (
                        <div className="container flex flex-col">
                            <div className="bg-background rounded-lg shadow-lg">
                                {voterHistories?.data &&
                                voterHistories.data.length > 0 ? (
                                    <VoterHistoryTable
                                        voterHistories={
                                            voterHistories as PaginatedData<
                                                VoterHistoryData[]
                                            >
                                        }
                                        filters={searchParams}
                                        unifiedSearch={true}
                                        customTitle={t('votes')}
                                    />
                                ) : (
                                    <div className="py-8 text-center">
                                        <RecordsNotFound />
                                    </div>
                                )}
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
      
            <FiltersProvider
                defaultFilters={{} as SearchParams}
              
            >
                <VotesComponent {...props} />
            </FiltersProvider>
    );
};

export default Votes;
