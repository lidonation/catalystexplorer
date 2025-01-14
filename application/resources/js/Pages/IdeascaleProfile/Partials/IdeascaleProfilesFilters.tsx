import { RangePicker } from '@/Components/RangePicker';
import { SearchSelect } from '@/Components/SearchSelect';
import Selector from '@/Components/Select';
import { useFilterContext } from '@/Context/FiltersContext';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProposalSearchParams } from '../../../../types/proposal-search-params';
import FundingStatusToggle from './FundingStatusToggle';
import IdeascaleProfilesSearchControls from './IdeascaleProfileSearchControls';

export default function IdeascaleProfilesFilters() {
    const { t } = useTranslation();

    const ideascaleFilters = {
        funds: [{ value: 'fund1', label: 'Fund 1' }],
        project_status: [],
        tags: [{ value: 'tag1', label: 'Tag 1' }],
    };

    const handleFundingStatusChange = (): void => {
        setFundingStatus(!fundingStatus);
    };

    const [fundingStatus, setFundingStatus] = useState(true);
    const [budgetRange, setBudgetRange] = useState([1000, 50000]);
    const [projectStatus, setProjectStatus] = useState([]);

    return (
        <>
            <div className="container w-full rounded-xl bg-background p-4 shadow-md">
                <div className="grid grid-cols-2 items-center gap-4 lg:grid-cols-5 lg:gap-8">
                    <div>
                        <span className="mb-1 block text-sm font-medium">
                            {t('ideascaleProfiles.limitFunds')}
                        </span>
                        <SearchSelect
                            key="funds"
                            domain="funds"
                            selected={ideascaleFilters.funds.map(
                                (fund) => fund.value,
                            )}
                            onChange={(value) =>
                                console.log('Selected Funds:', value)
                            }
                            placeholder="Select"
                            multiple={false}
                        />
                    </div>

                    <div>
                        <span className="mb-1 block text-sm font-medium">
                            {t('ideascaleProfiles.projectStatus')}
                        </span>
                        <Selector
                            isMultiselect={true}
                            options={[
                                { value: 'complete', label: 'Complete' },
                                { value: 'in_progress', label: 'In Progress' },
                                { value: 'unfunded', label: 'Unfunded' },
                            ]}
                            setSelectedItems={setProjectStatus}
                            selectedItems={projectStatus}
                        />
                    </div>

                    <div>
                        <span className="mb-1 block text-sm font-medium">
                            {t('ideascaleProfiles.limitTags')}
                        </span>
                        <SearchSelect
                            key="tags"
                            domain="tags"
                            selected={ideascaleFilters.tags.map(
                                (tag) => tag.value,
                            )}
                            onChange={(value) =>
                                console.log('Selected Tags:', value)
                            }
                            placeholder="Select Tags"
                            multiple={true}
                        />
                    </div>

                    <FundingStatusToggle
                        checked={fundingStatus}
                        onChange={handleFundingStatusChange}
                    />

                    <div className="col-span-2 sm:col-span-2 lg:col-span-1">
                        <RangePicker
                            key="budgets"
                            context="Budgets"
                            value={budgetRange}
                            onValueChange={setBudgetRange}
                            max={10000000}
                            min={1000}
                            defaultValue={[1000, 10000000]}
                        />
                    </div>
                </div>
            </div>
            <div className='w-full'>
                <IdeascaleProfilesSearchControls />
            </div>
        </>
    );
}
