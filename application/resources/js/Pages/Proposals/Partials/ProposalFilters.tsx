import { RangePicker } from '@/Components/RangePicker';
import { SearchSelect } from '@/Components/SearchSelect';
import Selector from '@/Components/Select';
import { useFilterContext } from '@/Context/FiltersContext';
import { ProposalParamsEnum } from '@/enums/proposal-search-params';
import { useTranslation } from 'react-i18next';
import { ProposalSearchParams } from '../../../../types/proposal-search-params';
import FundsFilter from './FundsFilter';
import FundsData = App.DataTransferObjects.FundData


interface ProposalFilterProps {
    funds: FundsData[]
}
const ProposalFilters: React.FC<ProposalFilterProps> = ({ funds }) => {
    const { filters, setFilters } = useFilterContext<ProposalSearchParams>();

    const fundFilters = Object.entries(funds).map(([key, value]) => {
        return { title: key, proposalCount: value };
    })

    const sortedFundFilters = fundFilters.sort((a, b) => {
        const numA = parseInt(a.title.split(" ")[1], 10);
        const numB = parseInt(b.title.split(" ")[1], 10);
        return numB - numA;
    });


    const { t } = useTranslation();
    return (
        <>
            <div className="w-full py-8">
                <ul className='content-gap scrollable snaps-scrollable'>
                    {
                        sortedFundFilters.map((fund, index) => (
                            <li key={index}>
                                <FundsFilter
                                    fundTitle={fund.title}
                                    totalProposals={fund.proposalCount}
                                    setSelectedItems={(value) => setFilters(ProposalParamsEnum.FUNDS, value)} 
                                    selectedItems={filters[ProposalParamsEnum.FUNDS]}/>
                            </li>
                        ))
                    }
                </ul>
            </div>
            <div className="container w-full rounded-xl bg-background p-4">
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

                    <div className="col-span-1 flex flex-col gap-2 pb-4">
                        <span>{t('proposals.filters.tags')}</span>
                        <SearchSelect
                            key={'tags'}
                            domain={'tags'}
                            selected={filters[ProposalParamsEnum.TAGS] ?? []}
                            onChange={(value) =>
                                setFilters(ProposalParamsEnum.TAGS, value)
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
                                filters[ProposalParamsEnum.CAMPAIGNS] ?? []
                            }
                            onChange={(value) =>
                                setFilters(ProposalParamsEnum.CAMPAIGNS, value)
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
                            selected={filters[ProposalParamsEnum.GROUPS] ?? []}
                            onChange={(value) =>
                                setFilters(ProposalParamsEnum.GROUPS, value)
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
                                filters[ProposalParamsEnum.COMMUNITIES] ?? []
                            }
                            onChange={(value) =>
                                setFilters(
                                    ProposalParamsEnum.COMMUNITIES,
                                    value,
                                )
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
                                // {
                                //     value: 'has_quick_pitch',
                                //     label: t('proposals.options.quickPitches'),
                                // },
                            ]}
                            setSelectedItems={(value) =>
                                setFilters(ProposalParamsEnum.COHORT, value)
                            }
                            selectedItems={filters[ProposalParamsEnum.COHORT]}
                        />
                    </div>

                    <div className="col-span-1 flex flex-col gap-2 pb-4">
                        <span>{t('proposals.filters.proposers')}</span>
                        <SearchSelect
                            domain={'ideascale_profiles'}
                            selected={filters[ProposalParamsEnum.PEOPLE] ?? []}
                            onChange={(value) =>
                                setFilters(ProposalParamsEnum.PEOPLE, value)
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
                            value={filters[ProposalParamsEnum.BUDGETS]}
                            onValueChange={(value) =>
                                setFilters<ProposalParamsEnum.BUDGETS>(
                                    ProposalParamsEnum.BUDGETS,
                                    value,
                                )
                            }
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
                            onValueChange={(value) =>
                                setFilters<ProposalParamsEnum.PROJECT_LENGTH>(
                                    ProposalParamsEnum.PROJECT_LENGTH,
                                    value,
                                )
                            }
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
        </>
    );
}

export default ProposalFilters;