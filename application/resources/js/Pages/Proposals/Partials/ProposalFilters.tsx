import { RangePicker } from '@/Components/RangePicker';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from '@/Components/Select';
import { useState } from 'react';

export default function ProposalFilters() {
    const [range, setRange] = useState([20, 80]);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);


    return (
        <div className="w-full rounded-xl bg-background p-4">
            <div className="w-96 pb-4 pt-6">
                <RangePicker
                    value={range}
                    onValueChange={(newRange: []) => setRange(newRange)}
                    max={100}
                    min={10}
                    step={1}
                    defaultValue={[20, 80]}
                />
            </div>

            <div className="w-96 pb-4 pt-6">
                <div className="rounded-lg bg-background">
                    <Select
                        
                        selectedItems={selectedItems}
                        onChange={setSelectedItems}
                    >
                        <SelectTrigger className="">
                            <div className="flex items-center gap-2">
                                <span>Groups</span>
                                {selectedItems.length > 0 && (
                                    <div className="flex size-5 items-center justify-center rounded-full bg-background-lighter">
                                        <span>{selectedItems.length}</span>
                                    </div>
                                )}
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
