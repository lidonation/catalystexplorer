import { RangePicker } from '@/Components/RangePicker';
import { SearchSelect } from '@/Components/SearchSelect';
import Selector from '@/Components/Select';
import { useFilterContext } from '@/Context/FiltersContext';
import { ProposalParamsEnum } from '@/enums/proposal-search-params';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProposalSearchParams } from '../../../../types/proposal-search-params';

export default function ProposalFilters() {
    const { filters, setFilters } = useFilterContext<ProposalSearchParams>();
    const { t } = useTranslation();
    const sortingOptions = [
        { value: 'created_at:asc', label: t('proposals.options.oldToNew') },
        { value: 'created_at:desc', label: t('proposals.options.newToOld') },
        { value: 'amount_requested:asc', label: t('proposals.options.lowToHigh') },
        { value: 'amount_requested:desc', label: t('proposals.options.highToLow') },
    ];

    
    return (
        <>
            <div className="container mx-auto flex justify-end px-0 pb-4 pt-6">
                <Selector
                    isMultiselect={false}
                    options={sortingOptions}
                    setSelectedItems={(value) =>
                        setFilters(ProposalParamsEnum.SORTS, value)
                    }
                    selectedItems={filters[ProposalParamsEnum.SORTS]}
                    context={t('proposals.options.sort')}
                />
            </div>
            <div className="w-full bg-background p-4">
                <b>{t('proposals.options.filterValues')}:</b>{' '}
                {JSON.stringify(filters)} <br />
                <div className="grid grid-cols-1 gap-x-4 gap-y-3 rounded-xl md:grid-cols-2 lg:grid-cols-4">
                    <div className="flex flex-col gap-2 pb-4 pt-6">
                        <span>Funding Status</span>
                        <Selector
                            isMultiselect={true}
                            options={[
                                {
                                    value: 'over_budget',
                                    label: t('proposals.options.overBudget'),
                                },
                                {
                                    value: 'not_approved',
                                    label: t('proposals.options.notApproved'),
                                },
                                {
                                    value: 'funded',
                                    label: t('proposals.options.funded'),
                                },
                                {
                                    value: 'fully_paid',
                                    label: t('proposals.options.fullyPaid'),
                                },
                            ]}
                            setSelectedItems={(value) =>
                                setFilters(
                                    ProposalParamsEnum.FUNDING_STATUS,
                                    value,
                                )
                            }
                            selectedItems={
                                filters[ProposalParamsEnum.FUNDING_STATUS]
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-2 pb-4 pt-6">
                        <span>Opensource</span>
                        <Selector
                            isMultiselect={false}
                            options={[
                                {
                                    value: '1',
                                    label: t(
                                        'proposals.options.opensourceProposals',
                                    ),
                                },
                                {
                                    value: '0',
                                    label: t(
                                        'proposals.options.nonOpensourceProposals',
                                    ),
                                },
                            ]}
                            setSelectedItems={(value) =>
                                setFilters(
                                    ProposalParamsEnum.OPENSOURCE_PROPOSALS,
                                    value,
                                )
                            }
                            selectedItems={
                                filters[ProposalParamsEnum.OPENSOURCE_PROPOSALS]
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-2 pb-4 pt-6">
                        <span>Project Status</span>
                        <Selector
                            isMultiselect={true}
                            options={[
                                {
                                    value: 'complete',
                                    label: t('proposals.options.complete'),
                                },
                                {
                                    value: 'in_progress',
                                    label: t('proposals.options.inProgress'),
                                },
                                {
                                    value: 'unfunded',
                                    label: t('proposals.options.unfunded'),
                                },
                            ]}
                            setSelectedItems={(value) =>
                                setFilters(
                                    ProposalParamsEnum.PROJECT_STATUS,
                                    value,
                                )
                            }
                            selectedItems={
                                filters[ProposalParamsEnum.PROJECT_STATUS]
                            }
                        />
                    </div>
                    <div className="flex flex-col gap-2 pb-4 pt-6">
                        <span className="">Project Status</span>
                        <SearchSelect
                            options={[
                                {
                                    value: 'over_budget',
                                    label: t('proposals.options.overBudget'),
                                },
                                {
                                    value: 'not_approved',
                                    label: t('proposals.options.notApproved'),
                                },
                                {
                                    value: 'funded',
                                    label: t('proposals.options.funded'),
                                },
                                {
                                    value: 'fully_paid',
                                    label: t('proposals.options.fullyPaid'),
                                },
                            ]}
                            selected={
                                filters[ProposalParamsEnum.FUNDING_STATUS]
                            }
                            onChange={(value) =>
                                setFilters(
                                    ProposalParamsEnum.FUNDING_STATUS,
                                    value,
                                )
                            }
                            placeholder="Select"
                            multiple={true}
                        />
                    </div>
                </div>
                <div className="my-6 w-full border-b"></div>
                <div className="grid grid-cols-1 gap-x-4 gap-y-3 rounded-xl lg:grid-cols-2">
                    <div className="pb-4">
                        <RangePicker
                            context={'Budgets'}
                            value={filters[ProposalParamsEnum.BUDGETS]}
                            onValueChange={(value) =>
                                setFilters<ProposalParamsEnum.BUDGETS>(
                                    ProposalParamsEnum.BUDGETS,
                                    value,
                                )
                            }
                            max={filters[ProposalParamsEnum.MAX_BUDGET]}
                            min={filters[ProposalParamsEnum.MIN_BUDGET]}
                            defaultValue={[
                                filters[ProposalParamsEnum.MIN_BUDGET],
                                filters[ProposalParamsEnum.MAX_BUDGET],
                            ]}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
