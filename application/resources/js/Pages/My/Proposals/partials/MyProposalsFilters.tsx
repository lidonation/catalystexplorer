import { RangePicker } from '@/Components/RangePicker';
import { SearchSelect } from '@/Components/SearchSelect';
import Selector from '@/Components/atoms/Selector';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { useLaravelReactI18n } from 'laravel-react-i18n';

const MyProposalFilters = () => {
    const { setFilters, getFilter } = useFilterContext();
    const { t } = useLaravelReactI18n();
    const budgetRange = [0, 10000000];
    const projectLengthRange = [0, 12];

    return (
        <>
            <div className="bg-background w-full rounded-xl">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl md:grid-cols-2 lg:grid-cols-3">
                    <div className="col-span-1 flex flex-col gap-2 pb-4">
                        <span>{t('proposals.filters.fund')}</span>
                        <SearchSelect
                            key={'funds'}
                            domain={'funds'}
                            selected={getFilter(ParamsEnum.FUNDS) ?? []}
                            onChange={(value) =>
                                setFilters({
                                    label: t('proposals.filters.fund'),
                                    value,
                                    param: ParamsEnum.FUNDS,
                                })
                            }
                            placeholder="Select"
                            multiple={true}
                            valueField={'hash'}
                            labelField={'title'}
                        />
                    </div>
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
                </div>

                <div className="my-6 w-full border-b"></div>
                <div className="grid grid-cols-1 gap-x-4 gap-y-3 rounded-xl lg:grid-cols-2">
                    <div className="pb-4">
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

                    <div className="pb-4">
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

export default MyProposalFilters;
