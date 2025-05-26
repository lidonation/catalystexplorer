import Paragraph from '@/Components/atoms/Paragraph';
import SecondarySearchControls from '@/Components/atoms/SecondarySearchControls';
import Title from '@/Components/atoms/Title';
import SearchBar from '@/Components/SearchBar';
import { FiltersProvider, useFilterContext } from '@/Context/FiltersContext';
import { VoteEnums } from '@/enums/vote-search-enums';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import VoteSortOptions from '@/lib/VoteSortOptions';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { Head, router } from '@inertiajs/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import VoteFilters from './Partials/VoteFilters';
import VoterHistoryTable from './Partials/VoterHistoryTable';
import VoteHistoryTableLoader from './Partials/VoterHistoryTableLoader';
import VoterHistoryData = App.DataTransferObjects.VoterHistoryData;

interface VoteHistoryProps {
    voterHistories?: PaginatedData<VoterHistoryData[]>;
    search?: string;
    secondarySearch?: string;
    sort?: string;
    filters?: SearchParams;
}

const IndexComponent: React.FC<VoteHistoryProps> = (props) => {
    const { setFilters, filters } = useFilterContext();
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const queryParams = new URLSearchParams(window.location.search);
    const initialStakeAddressQuery = queryParams.get(VoteEnums.QUERY) || '';
    const [stakeAddressQuery, setStakeAddressQuery] = useState(
        initialStakeAddressQuery,
    );
    const { t } = useTranslation();
    const { voterHistories } = props;
    const [hasSearchedStake, setHasSearchedStake] = useState(
        !!initialStakeAddressQuery,
    );
    const [searchPerformedWithNoResults, setSearchPerformedWithNoResults] =
        useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [shouldRefocus, setShouldRefocus] = useState(false);

    const isInitialNullState =
        !hasSearchedStake &&
        !isSearching &&
        (!voterHistories ||
            !voterHistories.data ||
            voterHistories.data.length === 0);

    const searchParams = useMemo(() => {
        const paramsObj = {} as SearchParams;
        filters.forEach((filter) => {
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
                    label = t('vote.stakeAddress');

                    setFilters({
                        param: key,
                        value: value,
                        label: label,
                    });
                } else if (key === VoteEnums.FUND) {
                    label = t('proposals.filters.epoch');
                    setFilters({
                        param: key,
                        value: value,
                        label: label,
                    });
                } else if (key === VoteEnums.CHOICE) {
                    label = t('vote.choice');
                    setFilters({
                        param: key,
                        value: value,
                        label: label,
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        if (
            hasSearchedStake &&
            voterHistories?.data &&
            voterHistories.data.length === 0
        ) {
            setSearchPerformedWithNoResults(true);
        } else {
            setSearchPerformedWithNoResults(false);
        }
    }, [hasSearchedStake, voterHistories]);

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

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
        if (stakeAddressQuery === search) {
            return;
        }

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        setIsSearching(true);
        setShouldRefocus(true);

        setStakeAddressQuery(search);
        setHasSearchedStake(!!search);

        setFilters({
            param: VoteEnums.QUERY,
            value: search,
            label: t('vote.stakeAddress'),
        });

        searchTimeoutRef.current = setTimeout(() => {
            const url = new URL(window.location.href);
            const params: Record<string, any> = {};

            params[VoteEnums.QUERY] = search;

            const secondarySearch = url.searchParams.get(
                VoteEnums.SECONDARY_QUERY,
            );
            if (secondarySearch) {
                params[VoteEnums.SECONDARY_QUERY] = secondarySearch;
            }

            for (const [key, value] of url.searchParams.entries()) {
                if (
                    key !== VoteEnums.QUERY &&
                    key !== VoteEnums.SECONDARY_QUERY &&
                    value
                ) {
                    params[key] = value;
                }
            }

            router.get(window.location.pathname, params, {
                preserveScroll: true,
                only: ['voterHistories', 'filters'],
                onFinish: () => {
                    setIsSearching(false);
                },
            });
        }, 300);
    };

    const sortOptions = VoteSortOptions();

    return (
        <>
            <Head title={t('vote.catalystVotes')} />

            <div className="container mt-4 flex flex-col">
                <div className="mt-6 mb-10">
                    <Title level="1">{t('vote.catalystVotes')}</Title>
                    <Paragraph
                        children={t('vote.viewOnchainTransactions')}
                        className="text-gray-persist"
                    />
                </div>
                <div className="mb-6">
                    <SearchBar
                        handleSearch={handleStakeAddressSearch}
                        autoFocus
                        showRingOnFocus
                        initialSearch={stakeAddressQuery}
                        placeholder={t('vote.searchBar')}
                        ref={searchInputRef}
                    />
                </div>

                {isSearching && <VoteHistoryTableLoader />}

                {isInitialNullState && (
                    <div className="bg-background mb-8 rounded-lg p-4 shadow-lg">
                        <Title
                            className="border-dark-light border-b pt-4 pb-4 font-bold"
                            level="3"
                        >
                            {t('vote.votingHistory')}
                        </Title>
                        <SecondarySearchControls
                            onFiltersToggle={setShowFilters}
                            sortOptions={sortOptions}
                            searchPlaceholder={t('vote.searchPlaceholder')}
                            searchParam={VoteEnums.SECONDARY_QUERY}
                            searchLabel={t('vote.secondarySearch')}
                        />
                        <section
                            className={`container overflow-hidden transition-all duration-500 ease-in-out ${
                                showFilters ? 'my-4 max-h-[500px]' : 'max-h-0'
                            }`}
                        >
                            <VoteFilters />
                        </section>
                        <div className="bg-background mb-10 flex w-full flex-col items-center justify-center rounded-lg px-4 py-8">
                            <RecordsNotFound context="search" showIcon={true} />
                            <Paragraph className="text-dark mt-4 text-center">
                                {t('vote.noStakeAddressFound')}
                            </Paragraph>
                        </div>
                    </div>
                )}

                {!isSearching && searchPerformedWithNoResults ? (
                    <div className="bg-background mb-8 rounded-lg p-4 shadow-lg">
                        <Title
                            className="border-dark-light border-b pt-4 pb-4 font-bold"
                            level="3"
                        >
                            {t('vote.votingHistory')}
                        </Title>
                        <SecondarySearchControls
                            onFiltersToggle={setShowFilters}
                            sortOptions={sortOptions}
                            searchPlaceholder={t('vote.searchPlaceholder')}
                            searchParam={VoteEnums.SECONDARY_QUERY}
                            searchLabel={t('vote.secondarySearch')}
                        />
                        <section
                            className={`container overflow-hidden transition-all duration-500 ease-in-out ${
                                showFilters ? 'my-4 max-h-[500px]' : 'max-h-0'
                            }`}
                        >
                            <VoteFilters />
                        </section>

                        <div className="bg-background mb-10 flex w-full flex-col items-center justify-center rounded-lg px-4 py-8">
                            <RecordsNotFound />
                            <Paragraph className="text-dark mt-4 text-center">
                                {t('vote.noStakeAddressFound')}
                            </Paragraph>
                        </div>
                    </div>
                ) : (
                    !isSearching &&
                    !isInitialNullState && (
                        <div className="bg-background mb-8 rounded-lg shadow-lg">
                            <VoterHistoryTable
                                voterHistories={
                                    voterHistories as PaginatedData<
                                        VoterHistoryData[]
                                    >
                                }
                                filters={searchParams}
                            />
                        </div>
                    )
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
                preserveScroll: true,
            }}
        >
            <IndexComponent {...props} />
        </FiltersProvider>
    );
};

export default Index;
