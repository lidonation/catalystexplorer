import { RangePicker } from '@/Components/RangePicker';
import { useState } from 'react';

export default function ProposalFilters() {
    const [range, setRange] = useState([20, 80]);

    return (
        <div className="w-full rounded-xl bg-background p-4">
            <div className="w-96 pb-4 pt-6">
                <RangePicker
                    value={range}
                    onValueChange={(newRange: []) => setRange(newRange)}
                    max={100}
                    step={1}
                    defaultValue={[20, 80]}
                />
            </div>
        </div>
    );
}
