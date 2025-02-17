import { RangePicker } from '@/Components/RangePicker';
import { SearchSelect } from '@/Components/SearchSelect';
import Selector from '@/Components/atoms/Selector';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { useTranslation } from 'react-i18next';

const ProposalFilters = () => {
    const { setFilters, getFilter } = useFilterContext();
    const { t } = useTranslation();
    const budgetRange = [0, 10000000];
    const projectLengthRange = [0, 12];

    return (
        <>
            <div className="bg-background w-full rounded-xl p-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl md:grid-cols-2 lg:grid-cols-5">
                    <div className="col-span-1 flex flex-col gap-2 pb-4">
                        <span>{t('proposals.filters.fundingStatus')}</span>
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
                                setFilters({
                                    label: t('proposals.filters.fundingStatus'),
                                    value,
                                    param: ParamsEnum.FUNDING_STATUS,
                                })
                            }
                            selectedItems={getFilter(
                                ParamsEnum.FUNDING_STATUS,
                            )}
                        />
                    </div>

                    <div className="col-span-1 flex flex-col gap-2 pb-4">
                        <span>{t('proposals.filters.opensource')}</span>
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
                                setFilters({
                                    label: t('proposals.filters.opensource'),
                                    value,
                                    param: ParamsEnum.OPENSOURCE_PROPOSALS,
                                })
                            }
                            selectedItems={getFilter(
                                ParamsEnum.OPENSOURCE_PROPOSALS,
                            )}
                        />
                    </div>

                    <div className="col-span-1 flex flex-col gap-2 pb-4">
                        <span>{t('proposals.filters.projectStatus')}</span>
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
                                setFilters({
                                    label: t('proposals.filters.projectStatus'),
                                    value,
                                    param: ParamsEnum.PROJECT_STATUS,
                                })
                            }
                            selectedItems={getFilter(
                                ParamsEnum.PROJECT_STATUS,
                            )}
                        />
                    </div>

                    <div className="col-span-1 flex flex-col gap-2 pb-4">
                        <span>{t('proposals.filters.tags')}</span>
                        <SearchSelect
                            key={'tags'}
                            domain={'tags'}
                            selected={getFilter(ParamsEnum.TAGS) ?? []}
                            onChange={(value) =>
                                setFilters({
                                    label: t('proposals.filters.tags'),
                                    value,
                                    param: ParamsEnum.TAGS,
                                })
                            }
                            placeholder="Select"
                            multiple={true}
                        />
                    </div>

                    <div className="col-span-2 flex flex-col gap-2 pb-4 lg:col-span-1">
                        <span>{t('proposals.filters.campaigns')}</span>
                        <SearchSelect
                            key={'campaigns'}
                            domain={'campaigns'}
                            selected={
                                getFilter(ParamsEnum.CAMPAIGNS) ?? []
                            }
                            onChange={(value) =>
                                setFilters({
                                    label: t('proposals.filters.campaigns'),
                                    value,
                                    param: ParamsEnum.CAMPAIGNS,
                                })
                            }
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
                            selected={
                                getFilter(ParamsEnum.GROUPS) ?? []
                            }
                            onChange={(value) =>
                                setFilters({
                                    label: t('proposals.filters.groups'),
                                    value,
                                    param: ParamsEnum.GROUPS,
                                })
                            }
                            placeholder="Select"
                            multiple={true}
                        />
                    </div>

                    <div className="col-span-1 flex flex-col gap-2 pb-4">
                        <span>{t('proposals.filters.communities')}</span>
                        <SearchSelect
                            key={'communities'}
                            domain={'communities'}
                            selected={
                                getFilter(ParamsEnum.COMMUNITIES) ?? []
                            }
                            onChange={(value) =>
                                setFilters({
                                    label: t('proposals.filters.communities'),
                                    value,
                                    param: ParamsEnum.COMMUNITIES,
                                })
                            }
                            placeholder="Select"
                            multiple={true}
                        />
                    </div>

                    <div className="col-span-1 flex flex-col gap-2 pb-4">
                        <span>{t('proposals.filters.communityCohort')}</span>
                        <Selector
                            isMultiselect={true}
                            options={[
                                {
                                    value: 'impact_proposal',
                                    label: t(
                                        'proposals.options.impactProposal',
                                    ),
                                },
                                {
                                    value: 'woman_proposal',
                                    label: t(
                                        'proposals.options.womenProposals',
                                    ),
                                },
                                {
                                    value: 'ideafest_proposal',
                                    label: t(
                                        'proposals.options.ideafestProposals',
                                    ),
                                },
                            ]}
                            setSelectedItems={(value) =>
                                setFilters({
                                    label: t(
                                        'proposals.filters.communityCohort',
                                    ),
                                    value,
                                    param: ParamsEnum.COHORT,
                                })
                            }
                            selectedItems={getFilter(ParamsEnum.COHORT)}
                        />
                    </div>

                    <div className="col-span-1 flex flex-col gap-2 pb-4">
                        <span>{t('proposals.filters.proposers')}</span>
                        <SearchSelect
                            domain={'ideascaleProfiles'}
                            selected={
                                getFilter(
                                    ParamsEnum.IDEASCALE_PROFILES,
                                ) ?? []
                            }
                            onChange={(value) =>
                                setFilters({
                                    label: t('proposals.filters.proposers'),
                                    value,
                                    param: ParamsEnum.IDEASCALE_PROFILES,
                                })
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
                            key={'Budgets'}
                            context={t('proposals.filters.budgets')}
                            value={
                                getFilter(ParamsEnum.BUDGETS)?.length ==
                                0
                                    ? budgetRange
                                    : getFilter(ParamsEnum.BUDGETS)
                            }
                            onValueChange={(value) =>
                                setFilters({
                                    label: t('proposals.filters.budgets'),
                                    value,
                                    param: ParamsEnum.BUDGETS,
                                })
                            }
                            max={budgetRange[1]}
                            min={budgetRange[0]}
                            defaultValue={budgetRange}
                        />
                    </div>

                    <div className="pb-4">
                        <RangePicker
                            key={'Project Length'}
                            context={t('proposals.filters.projectLength')}
                            value={
                                getFilter(ParamsEnum.PROJECT_LENGTH)
                                    ?.length == 0
                                    ? projectLengthRange
                                    : getFilter(
                                          ParamsEnum.PROJECT_LENGTH,
                                      )
                            }
                            onValueChange={(value) =>
                                setFilters({
                                    label: t('proposals.filters.projectLength'),
                                    value,
                                    param: ParamsEnum.PROJECT_LENGTH,
                                })
                            }
                            max={projectLengthRange[1]}
                            min={projectLengthRange[0]}
                            defaultValue={projectLengthRange}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProposalFilters;
