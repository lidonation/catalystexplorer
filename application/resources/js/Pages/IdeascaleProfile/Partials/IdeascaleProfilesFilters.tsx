import { RangePicker } from '@/Components/RangePicker';
import { useFilterContext } from '@/Context/FiltersContext';
import { ProposalParamsEnum } from '@/enums/proposal-search-params';
import { ProposalSearchParams } from '../../../../types/proposal-search-params';
import { SearchSelect } from '@/Components/SearchSelect';
import Selector from '@/Components/Select';import { useTranslation } from 'react-i18next';
import { useState } from 'react';

import FundingStatusToggle from './FundingStatusToggle';

export default function IdeascaleProfilesFilters() {
    const { t } = useTranslation();
    const { filters, setFilters } = useFilterContext<ProposalSearchParams>();
    const [fundingStatus, setFundingStatus] = useState(filters[ProposalParamsEnum.FUNDING_STATUS] == '1' ?  true : false);

    const handleFundingStatusChange = () => {
        const newFundingStatus = !fundingStatus;
        setFundingStatus(newFundingStatus);
        setFilters(ProposalParamsEnum.FUNDING_STATUS, newFundingStatus ? '1' : '');
    };

    return (
        <div className="container w-full rounded-xl bg-background shadow-md p-4">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 lg:gap-8 items-center">
                <div>
                    <span className="text-sm font-medium mb-1 block">{t('ideascaleProfiles.limitFunds')}</span>
                    <SearchSelect
                        key={'fund-titles'}
                        domain={'fundTitles'}
                        selected={
                            filters[ProposalParamsEnum.FUNDS] ?? []
                        }
                        onChange={(value) =>
                            setFilters(ProposalParamsEnum.FUNDS, value)
                        }
                        placeholder="Select"
                        multiple={false}
                    />
                </div>

                <div>
                    <span className="text-sm font-medium mb-1 block">{t('ideascaleProfiles.projectStatus')}</span>
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

                <div>
                    <span className="text-sm font-medium mb-1 block">{t('ideascaleProfiles.limitTags')}</span>
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

                <FundingStatusToggle
                    checked={fundingStatus}
                    onChange={handleFundingStatusChange}
                />

                <div className="col-span-2 sm:col-span-2 lg:col-span-1">
                    <RangePicker
                        key={'Budgets'}
                        context={t('proposals.filters.budgets')}
                        value={filters[ProposalParamsEnum.BUDGETS]}
                        onValueChange={(value: number[]) =>
                            setFilters(ProposalParamsEnum.BUDGETS, value)
                        }
                        max={filters[ProposalParamsEnum.MAX_BUDGET]}
                        min={filters[ProposalParamsEnum.MIN_BUDGET]}
                        defaultValue={filters[ProposalParamsEnum.BUDGETS]}
                    />
                </div>
            </div>
        </div>
    );
}
