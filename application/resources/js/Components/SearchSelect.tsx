'use client';
import Checkbox from '@/Components/atoms/Checkbox';
import { useSearchOptions } from '@/Hooks/useSearchOptions';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from './Command';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';
import { ScrollArea } from './ScrollArea';

export type SearchOption = {
    label?: string;
    hash?: string;
};

type SearchSelectProps = {
    selected: string[];
    onChange: (selectedItems: string[]) => void;
    placeholder?: string;
    emptyText?: string;
    multiple?: boolean;
    domain?: string;
    valueField: string;
    labelField: string;
    side?: 'top' | 'bottom' | 'left' | 'right';
    dataTestId?: string;
};

export function SearchSelect({
    selected,
    onChange,
    placeholder = 'Select',
    emptyText = 'No results found.',
    multiple = false,
    domain,
    labelField,
    valueField,
    side = 'top',
    dataTestId = 'search-select-container',
}: SearchSelectProps) {
    const [open, setOpen] = useState(false);

    const { searchTerm, setSearchTerm, options } =
        useSearchOptions<any>(domain);

    const { t } = useLaravelReactI18n();

    const filteredOptions = options.map((option) => {
        return {
            label: option[labelField],
            value: option[valueField],
        };
    });

    const sortedOptions = [...filteredOptions].sort((a, b) => {
        if (!selected.length) return 0;
        const aIsSelected = selected.includes(a.value);
        const bIsSelected = selected.includes(b.value);
        options;
        if (aIsSelected && !bIsSelected) return -1;
        if (!aIsSelected && bIsSelected) return 1;
        return 0;
    });

    const handleSelect = useCallback(
        (value: string) => {
            if (multiple) {
                const newSelected = selected.includes(value)
                    ? selected.filter((item) => item !== value)
                    : [...selected, value];
                onChange(newSelected);
            } else {
                onChange([value]);
                setOpen(false);
                setSearchTerm('');
            }
        },
        [multiple, onChange, selected, setSearchTerm],
    );

    const handleClear = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (selected.length) {
                onChange([]);
            }
            setSearchTerm('');
            setOpen(false);
        },
        [onChange, selected, setSearchTerm, selected.length, setSearchTerm],
    );

    // Clear search when closing the popover
    useEffect(() => {
        if (!open) {
            setSearchTerm('');
        }
    }, [open, setSearchTerm]);

    return (
        <Popover open={open} onOpenChange={() => setOpen(!open)} data-testid={dataTestId}>
            <PopoverTrigger asChild>
                <button
                    role="combobox"
                    aria-expanded={open}
                    aria-label={t('select') + ' ' + t('option')}
                    className="border-input placeholder:text-muted-foreground ring-offset-background flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    data-testid="search-select-trigger"
                >
                    <span className="flex items-center gap-2">
                        <span>{t('select') + ' '}</span>
                        {selected?.length > 0 && (
                            <div className="bg-background-lighter flex size-5 items-center justify-center rounded-full">
                                <span>{selected.length}</span>
                            </div>
                        )}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="bg-background relative z-100 w-[300px] min-w-[var(--radix-popover-trigger-width)] p-0"
                align="start"
                side={side}
                data-testid="search-select-content"
            >
                <Command shouldFilter={false}>
                    <div
                        className="flex items-center justify-between border-b px-3"
                        cmdk-input-wrapper=""
                    >
                        <CommandInput
                            placeholder="Search..."
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                            className={cn(
                                'flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
                                'border-none! ring-0! focus:border-none! focus:ring-0!',
                            )}
                            data-testid="search-select-input"
                        />
                        <button
                            aria-label={t('clear') + ' ' + t('select')}
                            onClick={handleClear}
                            className="hover:text-primary focus:outline-hidden"
                            data-testid="search-select-clear-button"
                        >
                            clear
                        </button>
                    </div>
                    <CommandEmpty>
                        {searchTerm.length > 1
                            ? t('proposals.options.noResults')
                            : t('proposals.options.typeMore')}
                    </CommandEmpty>
                    <CommandGroup>
                        <ScrollArea
                            className={`max-h-64 min-h-24 lg:max-h-96 ${options.length > 10 ? 'overflow-scroll' : ''}`}
                            data-testid="search-select-scroll-area"
                        >
                            {options &&
                                sortedOptions.map((option, index) => (
                                    <CommandItem
                                        key={`${option.value}-${index}`}
                                        value={option.value}
                                        onSelect={() =>
                                            handleSelect(option.value)
                                        }
                                        className="bg-background! hover:bg-background-lighter! aria-selected:bg-background-lighter flex cursor-pointer justify-between"
                                        data-testid={`search-select-option-${option.value}`}
                                    >
                                        {option.label}
                                        <Checkbox
                                            id={`checkbox-${option.value}-${index}`}
                                            checked={
                                                selected.length
                                                    ? selected?.includes(
                                                          option.value,
                                                      )
                                                    : false
                                            }
                                            value={option.value}
                                            onChange={() => {}}
                                            className="text-content-accent bg-background checked:bg-primary checked:hover:bg-primary focus:border-primary focus:ring-primary checked:focus:bg-primary mr-2 h-4 w-4 shadow-xs focus:border"
                                            data-testid={`search-select-checkbox-${option.value}`}
                                        />
                                    </CommandItem>
                                ))}
                        </ScrollArea>
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
