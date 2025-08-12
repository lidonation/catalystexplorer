import { Popover, PopoverContent, PopoverTrigger } from '@/Components/Popover';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import Checkbox from './Checkbox';

type SelectProps = {
    isMultiselect?: boolean;
    selectedItems: any;
    setSelectedItems: (updatedItems: any) => void;
    options?: {
        label: string;
        value: string | string[];
        disabled?: boolean;
        actualValues?: string[];
    }[];
    bgColor?: string;
    context?: string;
    basic?: boolean;
    className?: string;
    hideCheckbox?: boolean;
    placeholder?: string;
    disabled?: boolean;
    'data-testid'?: string;
    'data-testid-button'?: string;
};

export default function Selector({
    isMultiselect = false,
    context = '',
    options,
    selectedItems = [],
    setSelectedItems,
    className,
    bgColor = 'bg-background',
    hideCheckbox = false,
    placeholder = '',
    disabled = false,
    'data-testid': dataTestId = 'selector-container',
    'data-testid-button': dataTestIdButton = 'selector-button',
    ...props
}: SelectProps) {
    const [open, setOpen] = useState(false);

    const { t } = useLaravelReactI18n();

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
        <div className={cn('h-full rounded-lg', className + bgColor)} data-testid={dataTestId}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        role="combobox"
                        aria-expanded={open}
                        aria-label={t('select') + ' ' + t('option')}
                        className="border-input placeholder:text-muted-foreground ring-offset-background flex h-full w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        data-testid={dataTestIdButton}
                    >
                        <span className="flex items-center gap-2 overflow-hidden" data-testid="selector-selected-items">
                            <span className="overflow-clip text-sm text-nowrap">
                                {currentOption
                                    ? currentOption.label
                                    : placeholder}
                            </span>
                            {isMultiselect && selectedItems?.length > 0 && (
                                <div className="bg-background-lighter flex size-5 items-center justify-center rounded-full">
                                    <span>{selectedItems.length}</span>
                                </div>
                            )}
                        </span>
                        <ChevronDown className="h-4 w-4" />
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    className="bg-background relative z-150 w-full min-w-[var(--radix-popover-trigger-width)] p-1"
                    align="start"
                    data-testid="options-container"
                >
                    <div>
                        <div className="flex justify-end">
                            <button
                                aria-label={t('clear') + ' ' + t('select')}
                                onClick={onClearSelection}
                                className="hover:text-primary px-3 focus:outline-hidden"
                                data-testid="selector-clear-button"
                            >
                                clear
                            </button>
                        </div>
                        {options?.map((option) => {
                            const isOptionDisabled = option?.disabled;

                            return (
                                <div
                                    key={
                                        Array.isArray(option.value)
                                            ? option.value.join('-')
                                            : option.value
                                    }
                                    onClick={() => {
                                        if (!isOptionDisabled) {
                                            if (Array.isArray(option.value)) {
                                                option.value.forEach((val) =>
                                                    handleSelect(val),
                                                );
                                            } else {
                                                handleSelect(option.value);
                                            }
                                        }
                                    }}
                                    className={`bg-background! hover:bg-background-lighter! focus:bg-background-lighter aria-selected:bg-background-lighter relative flex w-full items-center justify-between rounded-xs px-3 py-1.5 text-sm outline-hidden select-none ${isOptionDisabled ? 'text-gray-persist cursor-not-allowed opacity-70' : 'cursor-default'} `}
                                    data-testid={`selector-option-${Array.isArray(option.value) ? option.value.join('-') : option.value}`}
                                >
                                    <span>{option.label}</span>

                                    {!hideCheckbox && (
                                        <Checkbox
                                         id={Array.isArray(option.value) ? option.value.join('-') : option.value}
                                         label={option.label || option.value}
                                         checked={
                                                 isMultiselect && selectedItems.length
                                                 ? selectedItems?.includes(option.value)
                                                 : selectedItems == option.value
                                                 }
                                             value={option.value}
                                            onChange={() => {}}
                                             className={`text-content-accent bg-background checked:bg-primary checked:hover:bg-primary focus:border-primary focus:ring-primary checked:focus:bg-primary ml-2 h-4 w-4 shadow-xs focus:border ${
                                        isOptionDisabled ? 'text-gray-persist cursor-not-allowed' : ''
                                        }`}
                                         disabled={isOptionDisabled}
                                           data-testid={`selector-checkbox-${Array.isArray(option.value) ? option.value.join('-') : option.value}`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
