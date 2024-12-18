import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';
import Checkbox from './Checkbox';

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
    className?: string;
    hideCheckbox?: boolean; // New prop to hide checkboxes
    placeholder?: string;  // New prop for custom placeholder
};

export default function Selector({
    isMultiselect = false,
    context = '',
    options,
    selectedItems = [],
    setSelectedItems,
    className,
    hideCheckbox = false, // Default to false
    placeholder = '',     // Default to empty string
    ...props
}: SelectProps) {
    const [open, setOpen] = useState(false);

    const { t } = useTranslation();

    let currentOption = null;

    // Use custom placeholder if provided, otherwise default logic
    let defaultPlaceholder = isMultiselect
        ? `${t('select')} `
        : `${t('select')} ${context}`;
    placeholder = placeholder || defaultPlaceholder;

    if (!isMultiselect && selectedItems) {
        currentOption = options?.find(
            (option) => selectedItems == option.value,
        );
    }

    const handleSelect = (value: string) => {
        setOpen(true);
        let updatedItems: any;

        if (!isMultiselect) {
            setSelectedItems(value == selectedItems ? [] : value);
            currentOption = options?.find((option) => value == option.value);
            setOpen(false);
            return;
        }

        if (selectedItems.includes(value)) {
            updatedItems = selectedItems.filter((item: any) => item !== value);
        } else {
            updatedItems = [...(selectedItems ?? []), value];
        }

        setSelectedItems(updatedItems);
    };

    const onClearSelection = () => {
        selectedItems.length ? setSelectedItems([]) : '';
        setOpen(false);
    };

    return (
        <div className={cn('h-full rounded-lg bg-background', className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        role="combobox"
                        aria-expanded={open}
                        aria-label={t('select') + ' ' + t('option')}
                        className="border-input placeholder:text-muted-foreground flex h-full w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <span className="flex items-center gap-2 overflow-hidden">
                            <span className="overflow-clip text-nowrap text-sm">
                                {currentOption
                                    ? currentOption.label
                                    : placeholder}
                            </span>
                            {isMultiselect && selectedItems?.length > 0 && (
                                <div className="flex size-5 items-center justify-center rounded-full bg-background-lighter">
                                    <span>{selectedItems.length}</span>
                                </div>
                            )}
                        </span>
                        <ChevronDown className="h-4 w-4" />
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    className="relative w-full min-w-[var(--radix-popover-trigger-width)] bg-background p-0"
                    align="start"
                >
                    <div>
                        <div className="flex justify-end">
                            <button
                                aria-label={t('clear') + ' ' + t('select')}
                                onClick={onClearSelection}
                                className="px-3 hover:text-primary focus:outline-none"
                            >
                                clear
                            </button>
                        </div>
                        {options?.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className="relative flex w-full cursor-default select-none items-center justify-between rounded-sm !bg-background px-3 py-1.5 text-sm outline-none hover:!bg-background-lighter focus:bg-background-lighter aria-selected:bg-background-lighter data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            >
                                <span>{option.label}</span>

                                {/* Conditionally render the checkbox */}
                                {!hideCheckbox && (
                                    <Checkbox
                                        id={option.value}
                                        checked={
                                            isMultiselect
                                                ? selectedItems?.includes(
                                                      option.value,
                                                  )
                                                : selectedItems == option.value
                                        }
                                        value={option.value}
                                        onChange={() => {}}
                                        className="text-content-accent h-4 w-4 bg-background shadow-sm checked:bg-primary checked:hover:bg-primary focus:border focus:border-primary focus:ring-primary checked:focus:bg-primary"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
