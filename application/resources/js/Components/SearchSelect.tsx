'use client';
import { cn } from '@/lib/utils';
import { Check, ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
    label: string;
    value: string;
};

type SearchSelectProps = {
    options: SearchOption[];
    selected: string[];
    onChange: (selectedItems: string[]) => void;
    placeholder?: string;
    emptyText?: string;
    multiple?: boolean;
};

export function SearchSelect({
    options,
    selected,
    onChange,
    placeholder = 'Select',
    emptyText = 'No results found.',
    multiple = false,
}: SearchSelectProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredOptions = useMemo(() => {
        if (!searchQuery) return options;

        return options.filter((option) =>
            option.label.toLowerCase().includes(searchQuery.toLowerCase()),
        );
    }, [options, searchQuery]);

    const handleSelect = useCallback(
        (value: string) => {
            if (multiple) {
                onChange(
                    selected.includes(value)
                        ? selected.filter((item) => item !== value)
                        : [...selected, value],
                );
            } else {
                onChange([value]);
                setOpen(false);
                setSearchQuery(''); // Clear search when item is selected
            }
        },
        [multiple, onChange, selected],
    );
    const handleClear = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onChange([]);
            setSearchQuery('');
        },
        [onChange],
    );

    // Clear search when closing the popover
    useEffect(() => {
        if (!open) {
            setSearchQuery('');
        }
    }, [open]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    role="combobox"
                    aria-expanded={open}
                    className="border-input placeholder:text-muted-foreground flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <span className="flex items-center gap-2">
                        {selected.length > 0
                            ? `${selected.length} selected`
                            : placeholder}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="w-full min-w-[var(--radix-popover-trigger-width)] bg-background p-0"
                align="start"
            >
                <Command shouldFilter={false}>
                    <div
                        className="flex items-center border-b px-3"
                        cmdk-input-wrapper=""
                    >
                        <CommandInput
                            placeholder="Search..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            className={cn(
                                'flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50',
                                '!border-none !ring-0 focus:!border-none focus:!ring-0',
                            )}
                        />
                        <button
                            onClick={handleClear}
                            className="text-sm hover:text-primary focus:outline-none"
                        >
                            clear
                        </button>
                    </div>
                    <CommandEmpty>{emptyText}</CommandEmpty>
                    <CommandGroup>
                        <ScrollArea className="h-fit">
                            {filteredOptions.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={() => handleSelect(option.value)}
                                    className="cursor-pointer !bg-background hover:!bg-background-lighter aria-selected:bg-background-lighter"
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            selected.includes(option.value)
                                                ? 'opacity-100'
                                                : 'opacity-0',
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </ScrollArea>
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
