import SearchBar from '@/Components/SearchBar';
import Selector from '@/Components/Select';
import { useFilterContext } from '@/Context/FiltersContext';
import { ProposalParamsEnum } from '@/enums/proposal-search-params';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProposalSearchParams } from '../../../../types/proposal-search-params';
import ActiveFilters from './ActiveFilters';
import Filters from '@/Components/svgs/Filters';

function ProposalSearchControls() {
    const { filters, setFilters } = useFilterContext<ProposalSearchParams>();
    const { t } = useTranslation();

    const queryParams = new URLSearchParams(window.location.search);
    const initialSearchQuery = queryParams.get(ProposalParamsEnum.QUERY) || '';
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [showFilters, setShowFilters] = useState(false);

    const sortingOptions = [
        { label: t('proposals.options.votesCastLowToHigh'), value: 'votes_cast:asc' },
        { label: t('proposals.options.votesCastHighToLow'), value: 'votes_cast:desc' },
        { label: t('proposals.options.budgetHighToLow'), value: 'amount_requested:desc' },
        { label: t('proposals.options.budgetLowToHigh'), value: 'amount_requested:asc' },
        { label: t('proposals.options.communityRankingHighToLow'), value: 'ranking_total:desc' },
        { label: t('proposals.options.communityRankingLowToHigh'), value: 'ranking_total:asc' },
        { label: t('proposals.options.paymentsReceivedHighToLow'), value: 'amount_received:desc' },
        { label: t('proposals.options.paymentsReceivedLowToHigh'), value: 'amount_received:asc' },
        { label: t('proposals.options.yesVotesHighToLow'), value: 'yes_votes_count:desc' },
        { label: t('proposals.options.yesVotesLowToHigh'), value: 'yes_votes_count:asc' },
        { label: t('proposals.options.noVotesHighToLow'), value: 'no_votes_count:desc' },
        { label: t('proposals.options.noVotesLowToHigh'), value: 'no_votes_count:asc' },
        { label: t('proposals.options.ratingHighToLow'), value: 'ca_rating:desc' },
        { label: t('proposals.options.ratingLowToHigh'), value: 'ca_rating:asc' },
        { label: t('proposals.options.impactAlignmentHighToLow'), value: 'alignment_score:desc' },
        { label: t('proposals.options.impactAlignmentLowToHigh'), value: 'alignment_score:asc' },
        { label: t('proposals.options.feasibilityHighToLow'), value: 'feasibility_score:desc' },
        { label: t('proposals.options.feasibilityLowToHigh'), value: 'feasibility_score:asc' },
        { label: t('proposals.options.valueForMoneyHighToLow'), value: 'auditability_score:desc' },
        { label: t('proposals.options.valueForMoneyLowToHigh'), value: 'auditability_score:asc' },
    ];

    useEffect(() => {
        setSearchQuery(initialSearchQuery);
    }, [initialSearchQuery]);

    const handleSearch = (search: string) => {
        setFilters(ProposalParamsEnum.QUERY, search);
        setSearchQuery(search);
    };

    const toggleFilters = () => {
        setShowFilters((prev) => !prev);
    };

    return (
        <div className="sticky top-0 z-10 mx-auto flex w-full flex-col gap-4 bg-background-lighter pb-4 pt-6">
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
                    <Filters className='text-white mt-2'/>
                    {t('proposals.filters.filters')}
                    {filters.length > 0 && (
                        <span className="ml-1 text-white">({filters.length})</span>
                    )}
                </button>

                <Selector
                    isMultiselect={false}
                    selectedItems={filters[ProposalParamsEnum.SORTS]}
                    setSelectedItems={(value) =>
                        setFilters(ProposalParamsEnum.SORTS, value)
                    }
                    options={sortingOptions}
                    hideCheckbox={true}
                    placeholder={t('proposals.options.sort')}
                    className={
                        filters[ProposalParamsEnum.SORTS]
                            ? 'cursor-default bg-background-lighter text-primary'
                            : 'text-gray-500 hover:bg-background-lighter'
                    }
                />
            </div>

            {showFilters && (
                <div className="container mx-auto flex justify-end px-0 pb-4 pt-6">
                    <ActiveFilters />
                </div>
            )}
        </div>
    );
}

export default ProposalSearchControls;
