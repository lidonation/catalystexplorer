import { RangePicker } from '@/Components/RangePicker';
import { SearchSelect } from '@/Components/SearchSelect';
import Selector from '@/Components/Selector';
import { useState } from 'react';
import { ProposalSearchParams } from '../../../../types/proposal-search-params';

export default function ProposalFilters({
    filters,
}: {
    filters: ProposalSearchParams;
}) {
    const [range, setRange] = useState([20, 80]);
    const [selectedFundingStatus, setSelectedFundingStatus] = useState<
        string[]
    >(['o']);
    const [selectedOpensourceStatus, setSelectedOpensourceStatus] = useState<
        string[]
    >([]);
    const [selectedProjectStatus, setSelectedProjectStatus] = useState<
        string[]
    >([]);
    const [selected, setSelected] = useState<string[]>([]);

    return (
        <div className="w-full bg-background p-4">
            <b>Filters Values:</b> {JSON.stringify(filters)} <br />
            <div className="grid grid-cols-1 gap-x-4 gap-y-3 rounded-xl md:grid-cols-2 lg:grid-cols-4">
                <div className="pb-4 pt-6">
                    <Selector
                        isMultiselect={true}
                        options={{
                            o: 'Over Budget',
                            n: 'Not Approved',
                            f: 'Funded',
                            p: 'Fully Paid',
                        }}
                        setSelectedItems={setSelectedFundingStatus}
                        selectedItems={selectedFundingStatus}
                        context={'Funding Status'}
                    />
                </div>

                <div className="pb-4 pt-6">
                    <Selector
                        isMultiselect={false}
                        options={{
                            1: 'Opensource Proposals',
                            0: 'Non-OpenSource Proposals',
                        }}
                        setSelectedItems={setSelectedOpensourceStatus}
                        selectedItems={selectedOpensourceStatus}
                        context={'Opensource'}
                    />
                </div>

                <div className="pb-4 pt-6">
                    <Selector
                        isMultiselect={true}
                        options={{
                            c: 'Complete',
                            i: 'In Progress',
                            u: 'Unfunded',
                        }}
                        setSelectedItems={setSelectedProjectStatus}
                        selectedItems={selectedProjectStatus}
                        context={'Project Status'}
                    />
                </div>
                <div className="flex flex-col gap-2 pb-4 pt-6">
                    <span>Project Status</span>
                    <SearchSelect
                        options={[
                            { value: 'o', label: 'Over Budget' },
                            { value: 'n', label: 'Not Approved' },
                            { value: 'f', label: 'Funded' },
                            { value: 'p', label: 'Fully Paid' },
                        ]}
                        selected={selected}
                        onChange={setSelected}
                        placeholder="Select status"
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
    );
}
