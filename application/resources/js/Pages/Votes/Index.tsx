import Title from '@/Components/atoms/Title';
import { Head, router } from '@inertiajs/react';
import Paragraph from '@/Components/atoms/Paragraph';
import { useTranslation } from 'react-i18next';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import VoterHistoryTable from './Partials/VoterHistoryTable';
import VoterHistoryData = App.DataTransferObjects.VoterHistoryData;
import { PaginatedData } from '../../../types/paginated-data';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import SearchBar from '@/Components/SearchBar';
import { VoteEnums } from '@/enums/vote-search-enums';
import { FiltersProvider, useFilterContext } from '@/Context/FiltersContext';
import { SearchParams } from '../../../types/search-params';
import Paginator from '@/Components/Paginator';

interface VoteHistoryProps {
    voterHistories?: PaginatedData<VoterHistoryData[]>;
    search?: string;
    sort?: string;
    filters?: SearchParams;
}

const IndexComponent: React.FC<VoteHistoryProps> = (props) => {
    const { getFilter, setFilters, filters } = useFilterContext();
    const searchInputRef = useRef<HTMLInputElement>(null);

    const queryParams = new URLSearchParams(window.location.search);
    const initialStakeAddressQuery = queryParams.get(VoteEnums.QUERY) || '';
    const [stakeAddressQuery, setStakeAddressQuery] = useState(initialStakeAddressQuery);
    const { t } = useTranslation();
    const { voterHistories } = props;
    const [hasSearchedStake, setHasSearchedStake] = useState(!!initialStakeAddressQuery);
    const [isSearching, setIsSearching] = useState(false);
    const [shouldRefocus, setShouldRefocus] = useState(false);

    const searchParams = useMemo(() => {
        const paramsObj = {} as SearchParams;
        filters.forEach(filter => {
            if (filter.param && filter.value !== undefined) {
                paramsObj[filter.param] = filter.value;
            }
        });
        return paramsObj;
    }, [filters]);

    useEffect(() => {
        const url = new URL(window.location.href);
        const params = url.searchParams;
        
        for (const [key, value] of params.entries()) {
            if (value) {
                let label = key;
                if (key === VoteEnums.QUERY) {
                    label = 'Stake Address';
                    setHasSearchedStake(true);
                }
                else if (key === VoteEnums.FUND) label = t('proposals.filters.epoch');
                else if (key === VoteEnums.CHOICE) label = 'Choice';
                
                setFilters({
                    param: key,
                    value: value,
                    label: label
                });
            }
        }
    }, []);

    // Effect to handle refocusing the stake address search field
    useEffect(() => {
        if (!isSearching && shouldRefocus && searchInputRef.current) {
            const timeoutId = setTimeout(() => {
                searchInputRef.current?.focus();
                setShouldRefocus(false);
            }, 100);
            
            return () => clearTimeout(timeoutId);
        }
    }, [isSearching, shouldRefocus]);

    const handleStakeAddressSearch = (search: string) => {
        setIsSearching(true);
        setShouldRefocus(true); // Set flag to return focus after search completes
        
        setFilters({
            param: VoteEnums.QUERY,
            value: search,
            label: 'Stake Address',
        });
        setStakeAddressQuery(search);
        setHasSearchedStake(!!search);
        
        router.get(window.location.pathname, { [VoteEnums.QUERY]: search }, {
            preserveScroll: true,
            only: ['voterHistories', 'filters'],
            onFinish: () => {
                setIsSearching(false);
                // We'll handle refocusing in the useEffect
            }
        });
    };

    return (
        <>
            <Head title="Catalyst Votes"/>

            <header>
                <div className='container'>
                    <Title>Catalyst Votes</Title>
                    <Paragraph children="View onchain (jormugandr) transactions of votes cast" className='text-'/>
                </div>
            </header>

            <div className="container mt-4 flex flex-col">
                <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">
                        Search by Stake Address
                    </h3>
                    <SearchBar
                        handleSearch={handleStakeAddressSearch}
                        autoFocus
                        showRingOnFocus
                        initialSearch={stakeAddressQuery}
                        placeholder={t('searchBar.stakeAddressPlaceholder', 'Paste stake address...')}
                        ref={searchInputRef}
                    />
                </div>
                
                {isSearching && (
                    <div className="w-full text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                        <p className="mt-2">Searching...</p>
                    </div>
                )}
                
                {!isSearching && (!hasSearchedStake || !voterHistories || !voterHistories.data || voterHistories.data.length === 0) ? (
                    <RecordsNotFound />
                ) : !isSearching && (
                    <div>
                        <div className="mb-4">
                            <h3 className="text-lg font-medium">
                                Total records: {voterHistories?.total || 0}
                            </h3>
                        </div>
                        
                        <VoterHistoryTable 
                            voterHistories={voterHistories?.data || []} 
                            filters={searchParams} 
                        />
                        
                        <section className="w-full px-4 lg:container lg:px-0 mt-4">
                            {voterHistories && <Paginator pagination={voterHistories} />}
                        </section>
                    </div>
                )}
            </div>
        </>
    );
};

const Index: React.FC<VoteHistoryProps> = (props) => {
    return (
        <FiltersProvider 
            defaultFilters={{} as SearchParams}
            routerOptions={{ 
                only: ['voterHistories'],
                preserveScroll: true 
            }}
        >
            <IndexComponent {...props} />
        </FiltersProvider>
    );
};

export default Index;
