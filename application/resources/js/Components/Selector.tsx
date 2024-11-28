import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger } from './Select';

type SelectProps = {
    isMultiselect?: boolean;
    selectedItems: any;
    setSelectedItems: (updatedItems: any) => void;
    options?: {
        label: string;
        value: string;
    }[];
    context?: string;
    basic?: boolean;
};

export default function Selector({
    isMultiselect = false,
    context = '',
    options,
    selectedItems = [],
    setSelectedItems,
    ...props
}: SelectProps) {
    const { t } = useTranslation();
    return (
        <div className="rounded-lg bg-background">
            <Select
                isMultiselect={isMultiselect}
                selectedItems={selectedItems}
                onChange={setSelectedItems}
            >
                <SelectTrigger
                    className=""
                    aria-label={t('select') + ' ' + t('option')}
                >
                    <div className="flex items-center gap-2">
                        <span>{t('select') + ' ' + context}</span>
                        {selectedItems.length > 0 && !context && (
                            <div className="flex size-5 items-center justify-center rounded-full bg-background-lighter">
                                <span>{selectedItems.length}</span>
                            </div>
                        )}
                    </div>
                </SelectTrigger>
                <SelectContent>
                    {Array.isArray(options) &&
                        options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                </SelectContent>
            </Select>
        </div>
    );
}
