import { RangePicker } from '@/Components/RangePicker';
import { SearchSelect } from '@/Components/SearchSelect';
import Selector from '@/Components/atoms/Selector';
import { useFilterContext } from '@/Context/FiltersContext'; // Import the custom hook
import { ParamsEnum } from '@/enums/proposal-search-params';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';
import FundingStatusToggle from './FundingStatusToggle';

export default function IdeascaleProfilesFilters() {
    const { t } = useLaravelReactI18n();
    const { filters, setFilters, getFilter } = useFilterContext();
    const [fundingStatus, setFundingStatus] = useState(
        getFilter(ParamsEnum.FUNDING_STATUS)?.[0] == 'funded' ? true : false,
    );
    const budgetRange = [0, 10000000];

    const handleFundingStatusChange = () => {
        const newFundingStatus = !fundingStatus;
        setFundingStatus(newFundingStatus);
        setFilters({
            label: t('proposals.filters.fundingStatus'),
            value: newFundingStatus ? ['funded'] : ['unfunded'],
            param: ParamsEnum.FUNDING_STATUS,
        });
    };

    return (
        <div className="bg-background container mb-8 w-full overflow-x-auto rounded-xl p-4 shadow-md">
            <div className="grid grid-cols-2 items-center gap-4 lg:grid-cols-5 lg:gap-8">
                <div className="flex flex-col gap-2">
                    <span>{t('reviews.filters.funds')}</span>
                    <SearchSelect
                        key={'funds'}
                        domain={'funds'}
                        selected={getFilter(ParamsEnum.FUNDS) ?? []}
                        onChange={(value) =>
                            setFilters({
                                label: t('reviews.filters.funds'),
                                value,
                                param: ParamsEnum.FUNDS,
                            })
                        }
                        placeholder="Select"
                        multiple={true}
                        valueField={'id'}
                        labelField={'title'}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <span className="">
                        {t('ideascaleProfiles.projectStatus')}
                    </span>
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

                <div className="flex flex-col gap-2">
                    <span className="">{t('ideascaleProfiles.limitTags')}</span>
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
                        valueField={'id'}
                        labelField={'title'}
                    />
                </div>

                <FundingStatusToggle
                    checked={fundingStatus}
                    onChange={handleFundingStatusChange}
                />

                <div className="col-span-2 sm:col-span-2 lg:col-span-1">
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

                    <div className="col-span-2 sm:col-span-2 lg:col-span-1">
                        {/* <RangePicker
                            key="budgets"
                            context="Budgets"
                            value={budgetRange}
                            onValueChange={setBudgetRange}
                            max={10000000}
                            min={1000}
                            defaultValue={[1000, 10000000]}
                        /> */}
                    </div>
                </div>
            </div>
        </div>
    );
}
