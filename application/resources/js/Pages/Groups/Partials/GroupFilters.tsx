import { RangePicker } from '@/Components/RangePicker';
import { SearchSelect } from '@/Components/SearchSelect';
import Selector from '@/Components/atoms/Selector';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { useTranslation } from 'react-i18next';

interface GroupFiltersProps{
    proposalsCount: number;
    totalAwardedAda: number;
    totalAwardedUsd: number;
}

const GroupFilters = ({proposalsCount, totalAwardedAda, totalAwardedUsd}:GroupFiltersProps) => {
    const { setFilters, getFilter } = useFilterContext();
    const { t } = useTranslation();
    const proposalRange = [0, proposalsCount];
    const adaRange = [0, totalAwardedAda];
    const usdRange = [0, totalAwardedUsd];

    return (
        <>
            <div className="bg-background h-full w-full overflow-x-auto overflow-y-auto rounded-xl p-4">
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
                                    param: ParamsEnum.FUNDING_STATUS,
                                })
                            }
                            selectedItems={getFilter(ParamsEnum.FUNDING_STATUS)}
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
                            selectedItems={getFilter(ParamsEnum.PROJECT_STATUS)}
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
                            valueField={'hash'}
                            labelField={'title'}
                        />
                    </div>

                    <div className="col-span-2 flex flex-col gap-2 pb-4 lg:col-span-1">
                        <span>{t('proposals.filters.campaigns')}</span>
                        <SearchSelect
                            key={'campaigns'}
                            domain={'campaigns'}
                            selected={getFilter(ParamsEnum.CAMPAIGNS) ?? []}
                            onChange={(value) =>
                                setFilters({
                                    label: t('proposals.filters.campaigns'),
                                    value,
                                    param: ParamsEnum.CAMPAIGNS,
                                })
                            }
                            placeholder="Select"
                            multiple={true}
                            valueField={'hash'}
                            labelField={'title'}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl md:grid-cols-2 lg:grid-cols-3">
                    <div className="col-span-1 flex flex-col gap-2 pb-4">
                        <span>{t('proposals.filters.ideascaleProfiles')}</span>
                        <SearchSelect
                            key={'ideascale_profiles'}
                            domain={'ideascaleProfiles.index'}
                            selected={
                                getFilter(ParamsEnum.IDEASCALE_PROFILES) ?? []
                            }
                            onChange={(value) =>
                                setFilters({
                                    label: t(
                                        'proposals.filters.ideascaleProfiles',
                                    ),
                                    value,
                                    param: ParamsEnum.IDEASCALE_PROFILES,
                                })
                            }
                            placeholder="Select"
                            multiple={true}
                            valueField={'hash'}
                            labelField={'name'}
                        />
                    </div>

                    <div className="col-span-1 flex flex-col gap-2 pb-4">
                        <span>{t('proposals.filters.communities')}</span>
                        <SearchSelect
                            key={'communities'}
                            domain={'communities'}
                            selected={getFilter(ParamsEnum.COMMUNITIES) ?? []}
                            onChange={(value) =>
                                setFilters({
                                    label: t('proposals.filters.communities'),
                                    value,
                                    param: ParamsEnum.COMMUNITIES,
                                })
                            }
                            placeholder="Select"
                            multiple={true}
                            valueField={'hash'}
                            labelField={'title'}
                        />
                    </div>

                    <div className="col-span-1 flex flex-col gap-2 pb-4">
                        <span>{t('proposals.filters.communityCohort')}</span>
                        <Selector
                            isMultiselect={true}
                            options={[
                                {
                                    value: 'proposals_impact',
                                    label: t(
                                        'proposals.options.impactProposal',
                                    ),
                                },
                                {
                                    value: 'proposals_woman',
                                    label: t(
                                        'proposals.options.womenProposals',
                                    ),
                                },
                                {
                                    value: 'proposals_ideafest',
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
                </div>

                <div className="my-6 w-full border-b"></div>
                <div className="grid grid-cols-1 gap-x-4 gap-y-3 rounded-xl lg:grid-cols-3">
                    <div className="pb-4">
                        <RangePicker
                            key={'numberOfProposals'}
                            context={t('proposals.filters.numberOfProposals')}
                            value={
                                getFilter(ParamsEnum.PROPOSALS)?.length == 0
                                    ? proposalRange
                                    : getFilter(ParamsEnum.PROPOSALS)
                            }
                            onValueChange={(value) =>
                                setFilters({
                                    label: t(
                                        'proposals.filters.numberOfProposals',
                                    ),
                                    value,
                                    param: ParamsEnum.PROPOSALS,
                                })
                            }
                            max={proposalRange[1]}
                            min={proposalRange[0]}
                            defaultValue={proposalRange}
                        />
                    </div>

                    <div className="pb-4">
                        <RangePicker
                            key={'awardedAda'}
                            context={t('proposals.filters.awardedAda')}
                            value={getFilter(ParamsEnum.AWARDED_ADA)}
                            onValueChange={(value) => {
                                setFilters({
                                    label: t('proposals.filters.awardedAda'),
                                    value,
                                    param: ParamsEnum.AWARDED_ADA,
                                });
                            }}
                            max={adaRange[1]}
                            min={adaRange[0]}
                            defaultValue={adaRange}
                        />
                    </div>
                    <div className="pb-4">
                        <RangePicker
                            key={'awarded_usd'}
                            context={t('proposals.filters.awardedUsd')}
                            value={
                                getFilter(ParamsEnum.AWARDED_USD)?.length == 0
                                    ? usdRange
                                    : getFilter(ParamsEnum.AWARDED_USD)
                            }
                            onValueChange={(value) =>
                                setFilters({
                                    label: t('proposals.filters.awardedUsd'),
                                    value,
                                    param: ParamsEnum.AWARDED_USD,
                                })
                            }
                            max={usdRange[1]}
                            min={usdRange[0]}
                            defaultValue={usdRange}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default GroupFilters;
