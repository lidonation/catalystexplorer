import SearchBar from '@/Components/SearchBar';
import Selector from '@/Components/Select';
import Filters from '@/Components/svgs/Filters';
import { useFilterContext } from '@/Context/FiltersContext';
import { ProposalParamsEnum } from '@/enums/proposal-search-params';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ActiveFilters from './ActiveFilters';

function ProposalSearchControls() {
    const { getFilter, setFilters, filters } = useFilterContext();
    const { t } = useTranslation();

    const queryParams = new URLSearchParams(window.location.search);
    const initialSearchQuery = queryParams.get(ProposalParamsEnum.QUERY) || '';
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [showFilters, setShowFilters] = useState(false);

    const sortingOptions = [
        {
            label: t('proposals.options.votesCastLowToHigh'),
            value: 'votes_cast:asc',
        },
        {
            label: t('proposals.options.votesCastHighToLow'),
            value: 'votes_cast:desc',
        },
        {
            label: t('proposals.options.budgetHighToLow'),
            value: 'amount_requested:desc',
        },
        {
            label: t('proposals.options.budgetLowToHigh'),
            value: 'amount_requested:asc',
        },
        {
            label: t('proposals.options.communityRankingHighToLow'),
            value: 'ranking_total:desc',
        },
        {
            label: t('proposals.options.communityRankingLowToHigh'),
            value: 'ranking_total:asc',
        },
        {
            label: t('proposals.options.paymentsReceivedHighToLow'),
            value: 'amount_received:desc',
        },
        {
            label: t('proposals.options.paymentsReceivedLowToHigh'),
            value: 'amount_received:asc',
        },
        {
            label: t('proposals.options.yesVotesHighToLow'),
            value: 'yes_votes_count:desc',
        },
        {
            label: t('proposals.options.yesVotesLowToHigh'),
            value: 'yes_votes_count:asc',
        },
        {
            label: t('proposals.options.noVotesHighToLow'),
            value: 'no_votes_count:desc',
        },
        {
            label: t('proposals.options.noVotesLowToHigh'),
            value: 'no_votes_count:asc',
        },
        {
            label: t('proposals.options.ratingHighToLow'),
            value: 'ca_rating:desc',
        },
        {
            label: t('proposals.options.ratingLowToHigh'),
            value: 'ca_rating:asc',
        },
        {
            label: t('proposals.options.impactAlignmentHighToLow'),
            value: 'alignment_score:desc',
        },
        {
            label: t('proposals.options.impactAlignmentLowToHigh'),
            value: 'alignment_score:asc',
        },
        {
            label: t('proposals.options.feasibilityHighToLow'),
            value: 'feasibility_score:desc',
        },
        {
            label: t('proposals.options.feasibilityLowToHigh'),
            value: 'feasibility_score:asc',
        },
        {
            label: t('proposals.options.valueForMoneyHighToLow'),
            value: 'auditability_score:desc',
        },
        {
            label: t('proposals.options.valueForMoneyLowToHigh'),
            value: 'auditability_score:asc',
        },
    ];

    useEffect(() => {
        setSearchQuery(initialSearchQuery);
    }, [initialSearchQuery]);

    const handleSearch = (search: string) => {
        setFilters({
            param: ProposalParamsEnum.QUERY,
            value: search,
            label: 'Search',
        });
        setSearchQuery(search);
    };

    const toggleFilters = () => {
        setShowFilters((prev) => !prev);
    };

    return (
        <div className="container sticky top-0 z-10 mx-auto flex w-full flex-col gap-4 bg-background-lighter pb-4 pt-6">
            <div className="flex items-center justify-end gap-2">
                <SearchBar
                    handleSearch={handleSearch}
                    autoFocus
                    showRingOnFocus
                    initialSearch={searchQuery}
                />

                <button
                    onClick={toggleFilters}
                    className="border-input placeholder:text-muted-foreground flex h-full items-center justify-between rounded-md border bg-background px-2 py-1 text-sm shadow-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                    aria-expanded={showFilters}
                >
                    <Filters className="mt-2 text-white" />
                    {t('proposals.filters.filters')}
                    {filters.length > 0 && (
                        <span className="ml-1 text-white">
                            ({filters.length})
                        </span>
                    )}
                </button>

                <Selector
                    isMultiselect={false}
                    selectedItems={getFilter(ProposalParamsEnum.SORTS)}
                    setSelectedItems={(value) =>
                        setFilters({
                            param: ProposalParamsEnum.SORTS,
                            value,
                            label: 'Sorts',
                        })
                    }
                    options={sortingOptions}
                    hideCheckbox={true}
                    placeholder={t('proposals.options.sort')}
                    className={
                        getFilter(ProposalParamsEnum.SORTS)
                            ? 'cursor-default bg-background-lighter text-primary'
                            : 'text-gray-500 hover:bg-background-lighter'
                    }
                />
            </div>

            {showFilters && (
                <div className="container mx-auto flex justify-start px-0 py-2">
                    <ActiveFilters />
                </div>
            )}
        </div>
    );
}

export default ProposalSearchControls;
