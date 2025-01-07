import Button from '@/Components/atoms/Button';
import Selector from '@/Components/Select';
import FilterLinesIcon from '@/Components/svgs/FilterLinesIcon';
import { useFilterContext } from '@/Context/FiltersContext';
import { IdeaScaleSearchEnum } from '@/enums/ideascale-search-enums';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IdeaScaleSearchParams } from '../../../../types/ideascale-search-params';
import IdeascaleProfilesFilters from './IdeascaleProfilesFilters';

const IdeaScaleProfileToolbar = () => {
    const [toggleFilterVisibility, setToggleFilterVisibility] = useState(false);
    const { filters, setFilters } = useFilterContext<IdeaScaleSearchParams>();
    const filterRef = useRef(null) as any;
    const { t } = useTranslation();
    const [contentHeight, setContentHeight] = useState(0);

    const sortingOptions = [
        {
            label: t('ideascaleProfiles.options.alphabeticallyAsc'), // Alphabetically: A to Z
            value: 'name:asc',
        },
        {
            label: t('ideascaleProfiles.options.alphabeticallyDesc'), // Alphabetically: Z to A
            value: 'name:desc',
        },
        {
            label: t('ideascaleProfiles.options.awardedAdaHighToLow'), // Amount Awarded Ada: High to Low
            value: 'amount_awarded_ada:desc',
        },
        {
            label: t('ideascaleProfiles.options.awardedAdaLowToHigh'), // Amount Awarded Ada: Low to High
            value: 'amount_awarded_ada:asc',
        },
        {
            label: t('ideascaleProfiles.options.awardedUsdHighToLow'), // Amount Awarded USD: High to Low
            value: 'amount_awarded_usd:desc',
        },
        {
            label: t('ideascaleProfiles.options.awardedUsdLowToHigh'), // Amount Awarded USD: Low to High
            value: 'amount_awarded_usd:asc',
        },
        {
            label: t('ideascaleProfiles.options.primaryProposalCountHighToLow'), // Primary Proposal Count: High to Low
            value: 'own_proposals_count:desc',
        },
        {
            label: t('ideascaleProfiles.options.primaryProposalCountLowToHigh'), // Primary Proposal Count: Low to High
            value: 'own_proposals_count:asc',
        },
        {
            label: t('ideascaleProfiles.options.coProposalCountHighToLow'), // Co-Proposal Count: High to Low
            value: 'co_proposals_count:desc',
        },
        {
            label: t('ideascaleProfiles.options.coProposalCountLowToHigh'), // Co-Proposal Count: Low to High
            value: 'co_proposals_count:asc',
        },
    ];

    useEffect(() => {
        if (filterRef.current) {
            setContentHeight(
                toggleFilterVisibility ? filterRef.current.scrollHeight : 0,
            );
        }
    }, [toggleFilterVisibility]);

    return (
        <div className="flex w-full flex-col gap-4">
            <div className="flex flex-row items-center justify-between gap-2">
                <div>
                    {/* Placeholder for search bar */}
                </div>
                <div className="flex flex-row gap-2">
                    <Button
                        className={`shadow-xs border-input flex flex-row items-center gap-2 rounded-lg border bg-transparent px-2 py-1 text-primary ${
                            toggleFilterVisibility
                                ? 'border-accent-blue ring-1 ring-offset-background'
                                : ''
                        }`}
                        onClick={() =>
                            setToggleFilterVisibility(!toggleFilterVisibility)
                        }
                    >
                        <FilterLinesIcon width={16} />
                        <span>{t('filters')}</span>
                    </Button>
                    <Selector
                        isMultiselect={false}
                        selectedItems={filters[IdeaScaleSearchEnum.SORTS]}
                        setSelectedItems={(value) =>
                            setFilters(IdeaScaleSearchEnum.SORTS, value)
                        }
                        options={sortingOptions}
                        hideCheckbox={true}
                        placeholder={t('proposals.options.sort')}
                        className={
                            'cursor-default bg-background-lighter text-primary'
                        }
                    />
                </div>
            </div>
            <div
                ref={filterRef}
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ height: `${contentHeight}px` }}
            >
                <IdeascaleProfilesFilters />
            </div>
        </div>
    );
};

export default IdeaScaleProfileToolbar;
