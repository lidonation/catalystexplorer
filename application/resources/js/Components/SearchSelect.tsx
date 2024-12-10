'use client';
import { useSearchOptions } from '@/Hooks/useSearchOptions';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Checkbox from './Checkbox';
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
    id?: string;
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

    const filteredOptions = options.map(
        (option: {
            name?: string;
            title?: string;
            label?: string;
            id: number;
        }) => {
            return {
                label: option?.name ?? option?.title ?? option?.label,
                id: option.id,
            };
        },
    );

    const handleSelect = useCallback(
        (value: string) => {
            if (multiple) {
                onChange(
                    selected.includes(value)
                        ? selected.filter((item) => item !== value)
                        : [...(selected ?? []), value],
                );
            } else {
                onChange([value]);
                setOpen(false);
                setSearchTerm(''); // Clear search when item is selected
            }
        },
        [multiple, onChange, selected],
    );
    const handleClear = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            selected.length ? onChange([]) : '';
            setSearchTerm('');
            setOpen(false);
        },
        [onChange],
    );

    // Clear search when closing the popover
    useEffect(() => {
        if (!open) {
            setSearchTerm('');
        }
    }, [open]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    role="combobox"
                    aria-expanded={open}
                    aria-label={t('select') + ' ' + t('option')}
                    className="border-input placeholder:text-muted-foreground flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <span className="flex items-center gap-2">
                        <span>{t('select') + ' '}</span>
                        {selected?.length > 0 && (
                            <div className="flex size-5 items-center justify-center rounded-full bg-background-lighter">
                                <span>{selected.length}</span>
                            </div>
                        )}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="min-w-[var(--radix-popover-trigger-width)] bg-background p-0"
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
                                'flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50',
                                '!border-none !ring-0 focus:!border-none focus:!ring-0',
                            )}
                        />
                        <button
                            aria-label={t('clear') + ' ' + t('select')}
                            onClick={handleClear}
                            className="hover:text-primary focus:outline-none"
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
                                filteredOptions.map((option) => (
                                    <CommandItem
                                        key={option.id}
                                        value={option.id.toString()}
                                        onSelect={() =>
                                            handleSelect(option.id.toString())
                                        }
                                        className="flex cursor-pointer justify-between !bg-background hover:!bg-background-lighter aria-selected:bg-background-lighter"
                                    >
                                        {option.label}
                                        <Checkbox
                                            id={option.id.toString()}
                                            checked={selected?.includes(
                                                option.id.toString(),
                                            )}
                                            value={option.id.toString()}
                                            onChange={() => {}}
                                            className="mr-2 h-4 w-4 checked:bg-primary checked:hover:bg-primary focus:border-0 focus:ring-0 checked:focus:bg-primary"
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
