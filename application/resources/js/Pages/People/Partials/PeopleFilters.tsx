import { useState } from 'react';
import Selector from '@/Components/Select';
import { useTranslation } from 'react-i18next';
import FundingStatusToggle from './FundingStatusToggle';
import { SearchSelect } from '@/Components/SearchSelect';
import { RangePicker } from '@/Components/RangePicker';

export default function PeopleFilters() {
    const { t } = useTranslation();

    const filters = {
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
        <div className="container w-full rounded-xl bg-background shadow-md p-4">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 lg:gap-8 items-center">
                <div>
                    <span className="text-sm font-medium mb-1 block">{t('people.limitFunds')}</span>
                    <SearchSelect
                        key="funds"
                        domain="funds"
                        selected={filters.funds.map(fund => fund.value)}
                        onChange={(value) => console.log('Selected Funds:', value)}
                        placeholder="Select"
                        multiple={false}
                    />
                </div>

                <div>
                    <span className="text-sm font-medium mb-1 block">{t('people.projectStatus')}</span>
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
                    <span className="text-sm font-medium mb-1 block">{t('people.limitTags')}</span>
                    <SearchSelect
                        key="tags"
                        domain="tags"
                        selected={filters.tags.map(tag => tag.value)}
                        onChange={(value) => console.log('Selected Tags:', value)}
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
    );
}
