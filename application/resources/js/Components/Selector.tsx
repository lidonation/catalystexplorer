import { Select, SelectContent, SelectItem, SelectTrigger } from './Select';

type SelectProps = {
    isMultiselect?: boolean;
    selectedItems: string[];
    setSelectedItems: (updatedItems: string[]) => void;
    options: Record<string, string>;
    context:string;
};

export default function Selector({
    isMultiselect = false,
    context = '',
    options = {},
    selectedItems = [],
    setSelectedItems,
    ...props
}: SelectProps) {
    return (
        <div className="rounded-lg bg-background">
            <Select
                isMultiselect={isMultiselect}
                selectedItems={selectedItems}
                onChange={setSelectedItems}
            >
                <SelectTrigger className="">
                    <div className="flex items-center gap-2">
                        <span>{context}</span>
                        {selectedItems.length > 0 && (
                            <div className="flex size-5 items-center justify-center rounded-full bg-background-lighter">
                                <span>{selectedItems.length}</span>
                            </div>
                        )}
                    </div>
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(options).map(([key, value]) => (
                        <SelectItem value={key}>{value}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
