import { RangePicker } from '@/Components/RangePicker';
import { SearchSelect } from '@/Components/SearchSelect';
import Selector from '@/Components/Select';
import { useFilterContext } from '@/Context/FiltersContext'; // Import the custom hook
import { ProposalParamsEnum } from '@/enums/proposal-search-params';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FundingStatusToggle from './FundingStatusToggle';

export default function IdeascaleProfilesFilters() {
    const { t } = useTranslation();
    const { filters, setFilters, getFilter } = useFilterContext();
    const [fundingStatus, setFundingStatus] = useState(
        getFilter(ProposalParamsEnum.FUNDING_STATUS)?.[0] == 'funded'
            ? true
            : false,
    );
    const budgetRange = [0, 10000000];

    const handleFundingStatusChange = () => {
        const newFundingStatus = !fundingStatus;
        setFundingStatus(newFundingStatus);
        setFilters({
            label: t('proposals.filters.fundingStatus'),
            value: newFundingStatus ? ['funded'] : ['unfunded'],
            param: ProposalParamsEnum.FUNDING_STATUS,
        });
    };

    return (
        <div className="container w-full rounded-xl bg-background p-4 shadow-md">
            <div className="grid grid-cols-2 items-center gap-4 lg:grid-cols-5 lg:gap-8">
                <div>
                    <span className="mb-1 block text-sm font-medium">
                        {t('ideascaleProfiles.limitFunds')}
                    </span>
                    <SearchSelect
                        key={'fund-titles'}
                        domain={'fundTitles'}
                        selected={getFilter(ProposalParamsEnum.FUNDS) ?? []}
                        onChange={(value) =>
                            setFilters({
                                label: t('ideascaleProfiles.limitFunds'),
                                value,
                                param: ProposalParamsEnum.FUNDS,
                            })
                        }
                        placeholder="Select"
                        multiple={true}
                    />
                </div>

                <div>
                    <span className="mb-1 block text-sm font-medium">
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
                                param: ProposalParamsEnum.PROJECT_STATUS,
                            })
                        }
                        selectedItems={getFilter(
                            ProposalParamsEnum.PROJECT_STATUS,
                        )}
                    />
                </div>

                <div>
                    <span className="mb-1 block text-sm font-medium">
                        {t('ideascaleProfiles.limitTags')}
                    </span>
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

                <FundingStatusToggle
                    checked={fundingStatus}
                    onChange={handleFundingStatusChange}
                />

                <div className="col-span-2 sm:col-span-2 lg:col-span-1">
                    <RangePicker
                        key={'Budgets'}
                        context={t('proposals.filters.budgets')}
                        value={
                            getFilter(ProposalParamsEnum.BUDGETS)?.length == 0
                                ? budgetRange
                                : getFilter(ProposalParamsEnum.BUDGETS)
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
