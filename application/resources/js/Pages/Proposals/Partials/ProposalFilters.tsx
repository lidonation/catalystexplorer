import { RangePicker } from '@/Components/RangePicker';
import { SearchSelect } from '@/Components/SearchSelect';
import Selector from '@/Components/Selector';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProposalSearchParams } from '../../../../types/proposal-search-params';

export default function ProposalFilters({
    filters,
}: {
    filters: ProposalSearchParams;
    onSort: (sortBy: string) => void;
}) {
    const { t } = useTranslation();
    const [range, setRange] = useState([20, 80]);
    const [selectedSort, setSelectedSort] = useState<string[]>([]);
    const [selectedFundingStatus, setSelectedFundingStatus] = useState<string[]>(['o']);
    const [selectedOpensourceStatus, setSelectedOpensourceStatus] = useState<string[]>([]);
    const [selectedProjectStatus, setSelectedProjectStatus] = useState<string[]>([]);
    const [selected, setSelected] = useState<string[]>([]);

    const sortingOptions = {
        created_at_asc: t('proposals.options.oldToNew'),
        created_at_desc: t('proposals.options.newToOld'),
        budget_asc: t('proposals.options.lowToHigh'),
        budget_desc: t('proposals.options.highToLow'),
    };

    return (
        <>
            <div className="container mx-auto flex justify-end pb-4 pt-6 px-0">
                <Selector
                isMultiselect={false}
                options={sortingOptions}
                setSelectedItems={setSelectedSort}
                selectedItems={selectedSort}
                context={t('proposals.options.sort')}
            />
            </div>
            <div className="w-full bg-background p-4">
                <b>{t('proposals.options.filterValues')}:</b>{' '}
                {JSON.stringify(filters)} <br />
                <div className="grid grid-cols-1 gap-x-4 gap-y-3 rounded-xl md:grid-cols-2 lg:grid-cols-4">
                    <div className="flex flex-col gap-2 pb-4 pt-6">
                        <span>Funding Status</span>
                        <Selector
                            isMultiselect={true}
                            options={[
                                {
                                    value: 'o',
                                    label: t('proposals.options.overBudget'),
                                },
                                {
                                    value: 'n',
                                    label: t('proposals.options.notApproved'),
                                },
                                {
                                    value: 'f',
                                    label: t('proposals.options.funded'),
                                },
                                {
                                    value: 'p',
                                    label: t('proposals.options.fullyPaid'),
                                },
                            ]}
                            setSelectedItems={setSelectedFundingStatus}
                            selectedItems={selectedFundingStatus}
                        />
                    </div>

                    <div className="flex flex-col gap-2 pb-4 pt-6">
                        <span>Opensource</span>
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
                            setSelectedItems={setSelectedOpensourceStatus}
                            selectedItems={selectedOpensourceStatus}
                        />
                    </div>

                    <div className="flex flex-col gap-2 pb-4 pt-6">
                        <span>Project Status</span>
                        <Selector
                            isMultiselect={true}
                            options={[
                                {
                                    value: 'c',
                                    label: t('proposals.options.complete'),
                                },
                                {
                                    value: 'i',
                                    label: t('proposals.options.inProgress'),
                                },
                                {
                                    value: 'u',
                                    label: t('proposals.options.unfunded'),
                                },
                            ]}
                            setSelectedItems={setSelectedProjectStatus}
                            selectedItems={selectedProjectStatus}
                        />
                    </div>
                    <div className="flex flex-col gap-2 pb-4 pt-6">
                        <span className="">Project Status</span>
                        <SearchSelect
                            options={[
                                {
                                    value: 'o',
                                    label: t('proposals.options.overBudget'),
                                },
                                {
                                    value: 'n',
                                    label: t('proposals.options.notApproved'),
                                },
                                {
                                    value: 'f',
                                    label: t('proposals.options.funded'),
                                },
                                {
                                    value: 'p',
                                    label: t('proposals.options.fullyPaid'),
                                },
                            ]}
                            selected={selected}
                            onChange={setSelected}
                            placeholder="Select"
                            multiple={true}
                        />
                    </div>
                </div>
                <div className="my-6 w-full border-b"></div>
                <div className="grid grid-cols-1 gap-x-4 gap-y-3 rounded-xl lg:grid-cols-2">
                    <div className="pb-4">
                        <RangePicker
                            context={'Budgets'}
                            value={range}
                            onValueChange={(newRange: []) => setRange(newRange)}
                            max={100}
                            min={10}
                            step={1}
                            defaultValue={[20, 80]}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
