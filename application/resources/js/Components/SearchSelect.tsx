'use client';
import { useSearchOptions } from '@/Hooks/useSearchOptions';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Checkbox from '@/Components/atoms/Checkbox';
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
};

export function SearchSelect({
    selected,
    onChange,
    placeholder = 'Select',
    emptyText = 'No results found.',
    multiple = false,
    domain,
}: SearchSelectProps) {
    const [open, setOpen] = useState(false);
    const { searchTerm, setSearchTerm, options } =
        useSearchOptions<any>(domain);

    const { t } = useTranslation();

    const filteredOptions = options.map((option) => {
        // Handle when option is a string
        if (typeof option === 'string') {
            return {
                label: option,
                hash: option
            };
        }
            // Handle when option is an object
            return {
                label: option?.name ?? option?.title ?? option?.label ?? 'Unknown',
                hash: option?.hash ?? option?.id?.toString() ?? 'unknown-hash',
            };
        },
    );

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
        [onChange, selected.length, setSearchTerm],
    );

    // Clear search when closing the popover
    useEffect(() => {
        if (!open) {
            setSearchTerm('');
        }
    }, [open, setSearchTerm]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    role="combobox"
                    aria-expanded={open}
                    aria-label={t('select') + ' ' + t('option')}
                    className="border-input placeholder:text-muted-foreground ring-offset-background flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
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
                className="bg-background min-w-[var(--radix-popover-trigger-width)] p-0"
                align="start"
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
                        />
                        <button
                            aria-label={t('clear') + ' ' + t('select')}
                            onClick={handleClear}
                            className="hover:text-primary focus:outline-hidden"
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
                        >
                            {options &&
                                filteredOptions.map((option) => {
                                    const hashStr = String(option.hash);
                                    const isSelected = selected.some(item => String(item) === hashStr);
                                    
                                    return (
                                        <CommandItem
                                            key={hashStr}
                                            value={hashStr}
                                            onSelect={() => handleSelect(hashStr)}
                                            className="bg-background! hover:bg-background-lighter! aria-selected:bg-background-lighter flex cursor-pointer justify-between"
                                        >
                                            {option.label}
                                            <Checkbox
                                                id={hashStr}
                                                checked={isSelected}
                                                value={hashStr}
                                                onChange={() => {}}
                                                className="text-content-accent bg-background checked:bg-primary checked:hover:bg-primary focus:border-primary focus:ring-primary checked:focus:bg-primary mr-2 h-4 w-4 shadow-xs focus:border"
                                            />
                                        </CommandItem>
                                    );
                                })}
                        </ScrollArea>
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
