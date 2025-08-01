import { RangePicker } from '@/Components/RangePicker';
import { SearchSelect } from '@/Components/SearchSelect';
import Selector from '@/Components/atoms/Selector';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import {useLaravelReactI18n} from "laravel-react-i18n";

const ProposalFilters = () => {
    const { setFilters, getFilter } = useFilterContext();
    const { t } = useLaravelReactI18n();
    const budgetRange = [0, 10000000];
    const projectLengthRange = [0, 12];

    return (
        <>
            <div className="bg-background w-full overflow-x-auto rounded-xl p-4" data-testid="proposal-filters">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl md:grid-cols-2 lg:grid-cols-5">
                    <div className="col-span-1 flex flex-col gap-2 pb-4" data-testid="funding-status-filter">
                        <span>{t('proposals.filters.fundingStatus')}</span>
                        <Selector
                            data-testid="funding-status-selector"
                            data-testid-button="funding-status-selector-button"
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
                                    value: 'funded_with_leftover',
                                    label: t('proposals.options.funded'),
                                    actualValues: ['funded', 'leftover'],
                                },
                                {
                                    value: 'fully_paid',
                                    label: t('proposals.options.fullyPaid'),
                                },
                            ]}
                            setSelectedItems={(value) => {
                                const selectorOptions = [
                                    {
                                        value: 'over_budget',
                                        label: t(
                                            'proposals.options.overBudget',
                                        ),
                                    },
                                    {
                                        value: 'not_approved',
                                        label: t(
                                            'proposals.options.notApproved',
                                        ),
                                    },
                                    {
                                        value: 'funded_with_leftover',
                                        label: t('proposals.options.funded'),
                                        actualValues: ['funded', 'leftover'],
                                    },
                                    {
                                        value: 'fully_paid',
                                        label: t('proposals.options.fullyPaid'),
                                    },
                                ];

                                const processedValue = value
                                    .map((item: any) => {
                                        const option = selectorOptions.find(
                                            (opt) => opt.value === item,
                                        );
                                        return option?.actualValues || item;
                                    })
                                    .flat();

                                setFilters({
                                    label: t('proposals.filters.fundingStatus'),
                                    value: processedValue,
                                    param: ParamsEnum.FUNDING_STATUS,
                                });
                            }}
                            selectedItems={(() => {
                                const currentFilter = getFilter(
                                    ParamsEnum.FUNDING_STATUS,
                                );
                                if (!currentFilter) return [];

                                const selectorOptions = [
                                    {
                                        value: 'over_budget',
                                        actualValues: ['over_budget'],
                                    },
                                    {
                                        value: 'not_approved',
                                        actualValues: ['not_approved'],
                                    },
                                    {
                                        value: 'funded_with_leftover',
                                        actualValues: ['funded', 'leftover'],
                                    },
                                    {
                                        value: 'fully_paid',
                                        actualValues: ['fully_paid'],
                                    },
                                ];

                                return selectorOptions
                                    .filter((option) =>
                                        option.actualValues.some((val) =>
                                            currentFilter.includes(val),
                                        ),
                                    )
                                    .map((option) => option.value);
                            })()}
                        />
                    </div>

                    <div className="col-span-1 flex flex-col gap-2 pb-4" data-testid="opensource-filter">
                        <span>{t('proposals.filters.opensource')}</span>
                        <Selector
                            data-testid="opensource-selector"
                            data-testid-button="opensource-selector-button"
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

                    <div className="col-span-1 flex flex-col gap-2 pb-4" data-testid="project-status-filter">
                        <span>{t('proposals.filters.projectStatus')}</span>
                        <Selector
                            data-testid="project-status-selector"
                            data-testid-button="project-status-selector-button"
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

                    <div className="col-span-1 flex flex-col gap-2 pb-4" data-testid="tags-filter">
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
                            dataTestId='tags-filter-search-select'
                        />
                    </div>

                    <div className="col-span-2 flex flex-col gap-2 pb-4 lg:col-span-1" data-testid="campaigns-filter">
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
                            dataTestId='campaigns-filter-search-select'
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl md:grid-cols-2 lg:grid-cols-4">
                    <div className="col-span-1 flex flex-col gap-2 pb-4" data-testid="groups-filter">
                        <span>{t('proposals.filters.groups')}</span>
                        <SearchSelect
                            key={'groups'}
                            domain={'groups'}
                            selected={getFilter(ParamsEnum.GROUPS) ?? []}
                            onChange={(value) =>
                                setFilters({
                                    label: t('proposals.filters.groups'),
                                    value,
                                    param: ParamsEnum.GROUPS,
                                })
                            }
                            placeholder="Select"
                            multiple={true}
                            valueField={'hash'}
                            labelField={'name'}
                            dataTestId='groups-filter-search-select'
                        />
                    </div>

                    <div className="col-span-1 flex flex-col gap-2 pb-4" data-testid="communities-filter">
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
                            dataTestId='communities-filter-search-select'
                        />
                    </div>

                    <div className="col-span-1 flex flex-col gap-2 pb-4" data-testid="cohort-filter">
                        <span>{t('proposals.filters.communityCohort')}</span>
                        <Selector
                            data-testid="cohort-selector"
                            data-testid-button="cohort-selector-button"
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

                    <div className="col-span-1 flex flex-col gap-2 pb-4" data-testid="ideascale-profiles-filter">
                        <span>{t('proposals.filters.proposers')}</span>
                        <SearchSelect
                            domain={'ideascaleProfiles.index'}
                            selected={
                                getFilter(ParamsEnum.IDEASCALE_PROFILES) ?? []
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
                            valueField={'hash'}
                            labelField={'name'}
                            dataTestId='ideascale-profiles-filter-search-select'
                        />
                    </div>
                </div>
                <div className="my-6 w-full border-b"></div>
                <div className="grid grid-cols-1 gap-x-4 gap-y-3 rounded-xl lg:grid-cols-2">
                    <div className="pb-4" data-testid="budgets-range-filter">
                        <RangePicker
                            key={'Budgets'}
                            context={t('proposals.filters.budgets')}
                            value={
                                getFilter(ParamsEnum.BUDGETS)?.length == 0
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

                    <div className="pb-4" data-testid="project-length-range-filter">
                        <RangePicker
                            key={'Project Length'}
                            context={t('proposals.filters.projectLength')}
                            value={
                                getFilter(ParamsEnum.PROJECT_LENGTH)?.length ==
                                0
                                    ? projectLengthRange
                                    : getFilter(ParamsEnum.PROJECT_LENGTH)
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
