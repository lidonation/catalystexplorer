import { RangePicker } from '@/Components/RangePicker';
import { SearchSelect } from '@/Components/SearchSelect';
import Selector from '@/Components/Select';
import { useFilterContext } from '@/Context/FiltersContext';
import { ProposalParamsEnum } from '@/enums/proposal-search-params';
import { useTranslation } from 'react-i18next';

const GroupFilters = () => {
    const { setFilters, getFilter } = useFilterContext();
    const { t } = useTranslation();
    const budgetRange = [0, 10000000];
    const projectLengthRange = [0, 12];

    return (
        <>
            <div className="bg-background w-full rounded-xl p-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl md:grid-cols-2 lg:grid-cols-4">
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
                                    param: ProposalParamsEnum.FUNDING_STATUS,
                                })
                            }
                            selectedItems={getFilter(
                                ProposalParamsEnum.FUNDING_STATUS,
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
                                    param: ProposalParamsEnum.PROJECT_STATUS,
                                })
                            }
                            selectedItems={getFilter(
                                ProposalParamsEnum.PROJECT_STATUS,
                            )}
                        />
                    </div>

                    <div className="col-span-1 flex flex-col gap-2 pb-4">
                        <span>{t('proposals.filters.tags')}</span>
                        <SearchSelect
                            key={'tags'}
                            domain={'tags'}
                            selected={getFilter(ProposalParamsEnum.TAGS) ?? []}
                            onChange={(value) =>
                                setFilters({
                                    label: t('proposals.filters.tags'),
                                    value,
                                    param: ProposalParamsEnum.TAGS,
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
                                getFilter(ProposalParamsEnum.CAMPAIGNS) ?? []
                            }
                            onChange={(value) =>
                                setFilters({
                                    label: t('proposals.filters.campaigns'),
                                    value,
                                    param: ProposalParamsEnum.CAMPAIGNS,
                                })
                            }
                            placeholder="Select"
                            multiple={true}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl md:grid-cols-2 lg:grid-cols-3">
                    <div className="col-span-1 flex flex-col gap-2 pb-4">
                        <span>{t('proposals.filters.ideascaleProfiles')}</span>
                        <SearchSelect
                            key={'ideascaleProfiles'}
                            domain={'ideascaleProfiles'}
                            selected={
                                getFilter(ProposalParamsEnum.IDEASCALE_PROFILES) ?? []
                            }
                            onChange={(value) =>
                                setFilters({
                                    label: t('proposals.filters.ideascaleProfiles'),
                                    value,
                                    param: ProposalParamsEnum.IDEASCALE_PROFILES,
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
                                getFilter(ProposalParamsEnum.COMMUNITIES) ?? []
                            }
                            onChange={(value) =>
                                setFilters({
                                    label: t('proposals.filters.communities'),
                                    value,
                                    param: ProposalParamsEnum.COMMUNITIES,
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
                                    param: ProposalParamsEnum.COHORT,
                                })
                            }
                            selectedItems={getFilter(ProposalParamsEnum.COHORT)}
                        />
                    </div>

                </div>

                <div className="my-6 w-full border-b"></div>
                <div className="grid grid-cols-1 gap-x-4 gap-y-3 rounded-xl lg:grid-cols-3">
                    <div className="pb-4">
                        <RangePicker
                            key={'numberOfProposals'}
                            context={t('proposals.filters.numberOfProposals')}
                            value={
                                getFilter(ProposalParamsEnum.PROPOSALS)?.length ==
                                0
                                    ? budgetRange
                                    : getFilter(ProposalParamsEnum.PROPOSALS)
                            }
                            onValueChange={(value) =>
                                setFilters({
                                    label: t('proposals.filters.budgets'),
                                    value,
                                    param: ProposalParamsEnum.BUDGETS,
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
                                getFilter(ProposalParamsEnum.PROJECT_LENGTH)
                                    ?.length == 0
                                    ? projectLengthRange
                                    : getFilter(
                                          ProposalParamsEnum.PROJECT_LENGTH,
                                      )
                            }
                            onValueChange={(value) =>
                                setFilters({
                                    label: t('proposals.filters.projectLength'),
                                    value,
                                    param: ProposalParamsEnum.PROJECT_LENGTH,
                                })
                            }
                            max={projectLengthRange[1]}
                            min={projectLengthRange[0]}
                            defaultValue={projectLengthRange}
                        />
                    </div>
                    <div className="pb-4">
                        <RangePicker
                            key={'Project Length'}
                            context={t('proposals.filters.projectLength')}
                            value={
                                getFilter(ProposalParamsEnum.PROJECT_LENGTH)
                                    ?.length == 0
                                    ? projectLengthRange
                                    : getFilter(
                                          ProposalParamsEnum.PROJECT_LENGTH,
                                      )
                            }
                            onValueChange={(value) =>
                                setFilters({
                                    label: t('proposals.filters.projectLength'),
                                    value,
                                    param: ProposalParamsEnum.PROJECT_LENGTH,
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

export default GroupFilters;
