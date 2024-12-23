import React, { useState } from 'react';
import { RangePicker } from '@/Components/RangePicker';
import { SearchSelect } from '@/Components/SearchSelect';
import Selector from '@/Components/Select';
import { useFilterContext } from '@/Context/FiltersContext';
import { ProposalParamsEnum } from '@/enums/proposal-search-params';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProposalSearchParams } from '../../../../types/proposal-search-params';
import Filters from '@/Components/svgs/Filters';

interface FiltersProps {
    initialFilters: string[];
    showFilters: boolean;
    toggleFilters: () => void;
    filters: string[];
    removeFilter: (filterToRemove: string) => void;
}

const ActiveProposalFilters: React.FC<FiltersProps> = ({
    initialFilters,
    showFilters,
    toggleFilters,
    filters,
    removeFilter,
}) => {
    const { t } = useTranslation();

    return (
        <div>
            <div className="bg-background border rounded-md mr-4 flex items-center px-2 py-1 h-9">
                <button onClick={toggleFilters} className="px-2 flex items-center justify-center" aria-expanded={showFilters}>
                <Filters
                        className="mt-2 text-white"
                        width={16}
                        height={16}
                    />
                    <span className="text-white font-medium">
                        {t('proposals.filters.filters')}
                    </span>
                    {filters.length > 0 && (
                        <span className="ml-2 text-sm text-gray-400">({filters.length})</span>
                    )}

                </button>
            </div>
        </div>
    );
};

interface ProposalFiltersProps {
    funds: { [key: string]: number };
}

const ProposalFilters: React.FC<ProposalFiltersProps> = ({ funds }) => {
    const { filters, setFilters } = useFilterContext<ProposalSearchParams>();
    const { t } = useTranslation();
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [showFilterOptions, setShowFilterOptions] = useState(false);

    const toggleFilters = () => {
        setShowFilters((prev) => !prev);
        setShowFilterOptions((prev) => !prev);
    };

    const handleFilterChange = (filterCategory: string, value: string[]) => {
        if (!filterCategory || !value) return;
        const newFilter = `${filterCategory}: ${value.join(', ')}`;

        setActiveFilters((prevFilters) =>
            prevFilters
                .filter((filter) => !filter.startsWith(`${filterCategory}:`))
                .concat(newFilter)
        );
    };

    const removeFilter = (filter: string) => {
        setActiveFilters(activeFilters.filter((f) => f !== filter));
    };

    const sortingOptions = [
        { value: 'created_at:asc', label: t('proposals.options.oldToNew') },
        { value: 'created_at:desc', label: t('proposals.options.newToOld') },
        { value: 'amount_requested:asc', label: t('proposals.options.lowToHigh') },
        { value: 'amount_requested:desc', label: t('proposals.options.highToLow') },
    ];

    return (
        <>
            <div className="container mx-auto flex justify-end px-0 pb-4 pt-6">
                <ActiveProposalFilters
                    initialFilters={activeFilters}
                    showFilters={showFilters}
                    toggleFilters={toggleFilters}
                    filters={activeFilters}
                    removeFilter={removeFilter}
                />
                <Selector
                    className="min-w-64"
                    isMultiselect={false}
                    options={sortingOptions}
                    setSelectedItems={(value) => setFilters(ProposalParamsEnum.SORTS, value)}
                    selectedItems={filters[ProposalParamsEnum.SORTS]}
                    context={t('proposals.options.sort')}
                />
            </div>

            {showFilterOptions && (
                <div className="w-full rounded-xl bg-background p-4">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl md:grid-cols-2 lg:grid-cols-5">
                        <div className="col-span-1 flex flex-col gap-2 pb-4">
                            <span>{t('proposals.filters.fundingStatus')}</span>
                            <Selector
                                isMultiselect={true}
                                options={[
                                    { value: 'over_budget', label: t('proposals.options.overBudget') },
                                    { value: 'not_approved', label: t('proposals.options.notApproved') },
                                    { value: 'funded', label: t('proposals.options.funded') },
                                    { value: 'fully_paid', label: t('proposals.options.fullyPaid') },
                                ]}
                                setSelectedItems={(value) => {
                                    handleFilterChange('Funding Status', value);
                                    setFilters(ProposalParamsEnum.FUNDING_STATUS, value);
                                }}
                                selectedItems={filters[ProposalParamsEnum.FUNDING_STATUS]}
                            />
                        </div>

                        <div className="col-span-1 flex flex-col gap-2 pb-4">
                            <span>{t('proposals.filters.opensource')}</span>
                            <Selector
                                isMultiselect={false}
                                options={[
                                    { value: '1', label: t('proposals.options.opensourceProposals') },
                                    { value: '0', label: t('proposals.options.nonOpensourceProposals') },
                                ]}
                                setSelectedItems={(value) => {
                                    handleFilterChange('Opensource Proposals', value);
                                    setFilters(ProposalParamsEnum.OPENSOURCE_PROPOSALS, value);
                                }}
                                selectedItems={filters[ProposalParamsEnum.OPENSOURCE_PROPOSALS]}
                            />
                        </div>

                        <div className="col-span-1 flex flex-col gap-2 pb-4">
                            <span>{t('proposals.filters.projectStatus')}</span>
                            <Selector
                                isMultiselect={true}
                                options={[
                                    { value: 'complete', label: t('proposals.options.complete') },
                                    { value: 'in_progress', label: t('proposals.options.inProgress') },
                                    { value: 'unfunded', label: t('proposals.options.unfunded') },
                                ]}
                                setSelectedItems={(value) => {
                                    handleFilterChange('Project Status', value);
                                    setFilters(ProposalParamsEnum.PROJECT_STATUS, value);
                                }}
                                selectedItems={filters[ProposalParamsEnum.PROJECT_STATUS]}
                            />
                        </div>

                        <div className="col-span-1 flex flex-col gap-2 pb-4">
                            <span>{t('proposals.filters.tags')}</span>
                            <SearchSelect
                                key={'tags'}
                                domain={'tags'}
                                selected={filters[ProposalParamsEnum.TAGS] ?? []}
                                onChange={(value) => {
                                    handleFilterChange('Tags', value);
                                    setFilters(ProposalParamsEnum.TAGS, value);
                                }}
                                placeholder="Select"
                                multiple={true}
                            />
                        </div>

                        <div className="col-span-2 flex flex-col gap-2 pb-4 lg:col-span-1">
                            <span>{t('proposals.filters.campaigns')}</span>
                            <SearchSelect
                                key={'campaigns'}
                                domain={'campaigns'}
                                selected={filters[ProposalParamsEnum.CAMPAIGNS] ?? []}
                                onChange={(value) => {
                                    handleFilterChange('Campaigns', value);
                                    setFilters(ProposalParamsEnum.CAMPAIGNS, value);
                                }}
                                placeholder="Select"
                                multiple={true}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl md:grid-cols-2 lg:grid-cols-4">
                        <div className="col-span-1 flex flex-col gap-2 pb-4">
                            <span>{t('proposals.filters.groups')}</span>
                            <SearchSelect
                                key={'groups'}
                                domain={'groups'}
                                selected={filters[ProposalParamsEnum.GROUPS] ?? []}
                                onChange={(value) => {
                                    handleFilterChange('Groups', value);
                                    setFilters(ProposalParamsEnum.GROUPS, value);
                                }}
                                placeholder="Select"
                                multiple={true}
                            />
                        </div>

                        <div className="col-span-1 flex flex-col gap-2 pb-4">
                            <span>{t('proposals.filters.communities')}</span>
                            <SearchSelect
                                key={'communities'}
                                domain={'communities'}
                                selected={filters[ProposalParamsEnum.COMMUNITIES] ?? []}
                                onChange={(value) => {
                                    handleFilterChange('Communities', value);
                                    setFilters(ProposalParamsEnum.COMMUNITIES, value);
                                }}
                                placeholder="Select"
                                multiple={true}
                            />
                        </div>

                        <div className="col-span-1 flex flex-col gap-2 pb-4">
                            <span>{t('proposals.filters.communityCohort')}</span>
                            <Selector
                                isMultiselect={true}
                                options={[
                                    { value: 'impact_proposal', label: t('proposals.options.impactProposal') },
                                    { value: 'woman_proposal', label: t('proposals.options.womenProposals') },
                                    { value: 'ideafest_proposal', label: t('proposals.options.ideafestProposals') },
                                ]}
                                setSelectedItems={(value) => {
                                    handleFilterChange('Community Cohort', value);
                                    setFilters(ProposalParamsEnum.COHORT, value);
                                }}
                                selectedItems={filters[ProposalParamsEnum.COHORT]}
                            />
                        </div>

                        <div className="col-span-1 flex flex-col gap-2 pb-4">
                            <span>{t('proposals.filters.proposers')}</span>
                            <SearchSelect
                                domain={'ideascale_profiles'}
                                selected={filters[ProposalParamsEnum.PEOPLE] ?? []}
                                onChange={(value) => {
                                    handleFilterChange('Proposers', value);
                                    setFilters(ProposalParamsEnum.PEOPLE, value);
                                }}
                                placeholder="Select"
                                multiple={true}
                            />
                        </div>
                    </div>

                    <div className="my-6 w-full border-b"></div>
                    <div className="grid grid-cols-1 gap-x-4 gap-y-3 rounded-xl lg:grid-cols-2">
                        <div className="pb-4">
                            <RangePicker
                                key={'Budgets'}
                                context={t('proposals.filters.budgets')}
                                value={filters[ProposalParamsEnum.BUDGETS]}
                                onValueChange={(value) => {
                                    handleFilterChange('Budgets', [value.toString()]);
                                    setFilters(ProposalParamsEnum.BUDGETS, value);
                                }}
                                max={filters[ProposalParamsEnum.MAX_BUDGET]}
                                min={filters[ProposalParamsEnum.MIN_BUDGET]}
                                defaultValue={filters[ProposalParamsEnum.BUDGETS]}
                            />
                        </div>

                        <div className="pb-4">
                            <RangePicker
                                key={'Project Length'}
                                context={t('proposals.filters.projectLength')}
                                value={filters[ProposalParamsEnum.PROJECT_LENGTH]}
                                onValueChange={(value) => {
                                    handleFilterChange('Project Length', [value.toString()]);
                                    setFilters(ProposalParamsEnum.PROJECT_LENGTH, value);
                                }}
                                max={filters[ProposalParamsEnum.MAX_PROJECT_LENGTH]}
                                min={filters[ProposalParamsEnum.MIN_PROJECT_LENGTH]}
                                defaultValue={[
                                    filters[ProposalParamsEnum.MIN_PROJECT_LENGTH],
                                    filters[ProposalParamsEnum.MAX_PROJECT_LENGTH],
                                ]}
                            />
                        </div>
                    </div>
                </div>
            )}

{showFilters && (
    <div className="flex mt-2 flex-wrap" aria-label={t('proposals.filters.activeFilters')}>
        {activeFilters.map((filter, index) => {
            const [category, value] = filter.split(': ') || [];
            return (
                <div
                    className="flex items-center h-9 justify-between border rounded-md bg-background px-2 py-1.5 text-sm whitespace-nowrap mr-2"
                    key={index}
                >
                    <p className="mr-1 whitespace-nowrap">
                        {`${category} - ${value}`}
                    </p>
                    <button
                        className="remove-button"
                        onClick={() => {
                            removeFilter(filter);

                            switch (category) {
                                case 'Funding Status':
                                    setFilters(ProposalParamsEnum.FUNDING_STATUS, []);
                                    break;
                                case 'Opensource Proposals':
                                    setFilters(ProposalParamsEnum.OPENSOURCE_PROPOSALS, []);
                                    break;
                                case 'Project Status':
                                    setFilters(ProposalParamsEnum.PROJECT_STATUS, []);
                                    break;
                                case 'Budgets':
                                    setFilters(ProposalParamsEnum.BUDGETS, [0, 0]);
                                    break;
                                default:
                                    console.warn(`Unknown filter category: ${category}`);
                            }
                        }}
                        aria-label={t('proposals.filters.removeFilter', { filter })}
                    >
                        ✕
                    </button>
                </div>
            );
        })}
    </div>
)}

        </>
    );
};

export default ProposalFilters;
