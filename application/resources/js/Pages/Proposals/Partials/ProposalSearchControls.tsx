import SearchBar from '@/Components/SearchBar';
import Selector from '@/Components/Select';
import { useFilterContext } from '@/Context/FiltersContext';
import { ProposalParamsEnum } from '@/enums/proposal-search-params';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProposalSearchParams } from '../../../../types/proposal-search-params';

function ProposalSearchControls() {
    const { filters, setFilters } = useFilterContext<ProposalSearchParams>();
    const { t } = useTranslation();

    const queryParams = new URLSearchParams(window.location.search);
    const initialSearchQuery = queryParams.get(ProposalParamsEnum.QUERY) || '';
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

    const sortingOptions = [
        {
            label: t('proposals.options.votesCastLowToHigh'), // Votes Cast: Low to High
            value: 'votes_cast:asc',
        },
        {
            label: t('proposals.options.votesCastHighToLow'), // Votes Cast: High to Low
            value: 'votes_cast:desc',
        },
        {
            label: t('proposals.options.budgetHighToLow'), // Budget: High to Low
            value: 'amount_requested:desc',
        },
        {
            label: t('proposals.options.budgetLowToHigh'), // Budget: Low to High
            value: 'amount_requested:asc',
        },
        {
            label: t('proposals.options.communityRankingHighToLow'), // Community Ranking: High to Low
            value: 'ranking_total:desc',
        },
        {
            label: t('proposals.options.communityRankingLowToHigh'), // Community Ranking: Low to High
            value: 'ranking_total:asc',
        },
        {
            label: t('proposals.options.paymentsReceivedHighToLow'), // Payments Received: High to Low
            value: 'amount_received:desc',
        },
        {
            label: t('proposals.options.projectLengthHighToLow'), // Project Length: High to Low
            value: 'project_length:desc',
        },
        {
            label: t('proposals.options.projectLengthLowToHigh'), // Project Length: Low to High
            value: 'project_length:asc',
        },
        {
            label: t('proposals.options.paymentsReceivedLowToHigh'), // Payments Received: Low to High
            value: 'amount_received:asc',
        },
        {
            label: t('proposals.options.yesVotesHighToLow'), // Yes Votes: High to Low
            value: 'yes_votes_count:desc',
        },
        {
            label: t('proposals.options.yesVotesLowToHigh'), // Yes Votes: Low to High
            value: 'yes_votes_count:asc',
        },
        {
            label: t('proposals.options.noVotesLowToHigh'), // No Votes: Low to High
            value: 'no_votes_count:asc',
        },
        {
            label: t('proposals.options.noVotesHighToLow'), // No Votes: High to Low
            value: 'no_votes_count:desc',
        },
        {
            label: t('proposals.options.ratingHighToLow'), // Rating: High to Low
            value: 'ca_rating:desc',
        },
        {
            label: t('proposals.options.ratingLowToHigh'), // Rating: Low to High
            value: 'ca_rating:asc',
        },
        {
            label: t('proposals.options.impactAlignmentHighToLow'), // Impact Alignment: High to Low
            value: 'alignment_score:desc',
        },
        {
            label: t('proposals.options.impactAlignmentLowToHigh'), // Impact Alignment: Low to High
            value: 'alignment_score:asc',
        },
        {
            label: t('proposals.options.feasibilityHighToLow'), // Feasibility: High to Low
            value: 'feasibility_score:desc',
        },
        {
            label: t('proposals.options.feasibilityLowToHigh'), // Feasibility: Low to High
            value: 'feasibility_score:asc',
        },
        {
            label: t('proposals.options.valueForMoneyHighToLow'), // Value for money: High to Low
            value: 'auditability_score:desc',
        },
        {
            label: t('proposals.options.valueForMoneyLowToHigh'), // Value for money: Low to High
            value: 'auditability_score:asc',
        },
    ];

    useEffect(() => {
        setSearchQuery(initialSearchQuery);
    }, [initialSearchQuery]);

    const handleSearch = (search: string) => {
        setFilters(ProposalParamsEnum.QUERY, search);
        setSearchQuery(search);
    };
    return (
        <div className="mx-auto flex w-full flex-col gap-4 bg-background-lighter pb-4 pt-6 sticky top-0 z-10">
            <div className="flex items-center justify-end gap-2">
                <SearchBar
                    handleSearch={handleSearch}
                    autoFocus
                    showRingOnFocus
                    initialSearch={searchQuery}
                />

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
            <div className="text-center">Active Filters goes here</div>
        </div>
    );
}

export default ProposalSearchControls;
