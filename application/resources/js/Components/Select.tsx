import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';

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
    const [open, setOpen] = useState(false);

    const { t } = useTranslation();

    let currentOption = null;

    let placeholder = isMultiselect ? `${t('select')} ` : `${t('select')} ${context}`;

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
            console.log({ currentOption });

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
    };

    return (
        <div className="rounded-lg bg-background">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        role="combobox"
                        aria-expanded={open}
                        aria-label={t('select') + ' ' + t('option')}
                        className="border-input placeholder:text-muted-foreground flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <span className="flex items-center gap-2">
                            <span>
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
                                className="mr-2 hover:text-primary focus:outline-none"
                            >
                                clear
                            </button>
                        </div>
                        {options?.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className="relative flex w-full cursor-default select-none items-center rounded-sm !bg-background py-1.5 pl-8 pr-2 text-sm outline-none hover:!bg-background-lighter focus:bg-background-lighter aria-selected:bg-background-lighter data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            >
                                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                    {(isMultiselect
                                        ? selectedItems?.includes(option.value)
                                        : selectedItems == option.value) && (
                                        <Check className="h-4 w-4" />
                                    )}
                                </span>
                                <span>{option.label}</span>
                            </div>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
