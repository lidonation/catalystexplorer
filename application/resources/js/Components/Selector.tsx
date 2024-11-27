import { Select, SelectContent, SelectItem, SelectTrigger } from './Select';

type SelectProps = {
    isMultiselect?: boolean;
    selectedItems: any;
    setSelectedItems: (updatedItems: any) => void;
    options: Record<string, string>;
    context: string;
    basic?: boolean;
};

export default function Selector({
    isMultiselect = false,
    context = '',
    options = {},
    selectedItems = [],
    setSelectedItems,
    basic = false,
    ...props
}: SelectProps) {
    return (
        <div className="rounded-lg bg-background">
            <Select
                isMultiselect={isMultiselect}
                selectedItems={selectedItems}
                onChange={setSelectedItems}  basic={false}            >
                <SelectTrigger className="">
                    <div className="flex items-center gap-2">
                        <span>{context}</span>
                        {selectedItems.length > 0 && !basic && (
                            <div className="flex size-5 items-center justify-center rounded-full bg-background-lighter">
                                <span>{selectedItems.length}</span>
                            </div>
                        )}
                    </div>
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(options).map(([key, value]) => (
                        <SelectItem value={key} key={key}>
                            {value}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
