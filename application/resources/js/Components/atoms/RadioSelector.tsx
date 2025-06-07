import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/Popover';

type RadioSelectorProps = {
    selectedItem: string | null;
    setSelectedItem: (value: string | null) => void;
    options?: {
        label: string;
        value: string;
    }[];
    bgColor?: string;
    context?: string;
    className?: string;
    placeholder?: string;
};

export default function RadioSelector({
    context = '',
    options,
    selectedItem,
    setSelectedItem,
    className,
    bgColor = 'bg-background',
    placeholder = '',
}: RadioSelectorProps) {
    const [open, setOpen] = useState(false);
    const { t } = useTranslation();

    const currentOption = options?.find((option) => selectedItem === option.value);

    let defaultPlaceholder = `${t('select')} ${context}`;
    placeholder = placeholder || defaultPlaceholder;

    const handleSelect = (value: string) => {
        const isSame = selectedItem === value;
        setSelectedItem(isSame ? null : value);
        setOpen(false);
    };

    const onClearSelection = () => {
        selectedItem && setSelectedItem(null);
        setOpen(false);
    };

    return (
        <div className={cn('h-full rounded-lg', className, bgColor)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        role="combobox"
                        aria-expanded={open}
                        aria-label={t('select') + ' ' + t('option')}
                        className="border-input placeholder:text-muted-foreground ring-offset-background flex h-fit w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <span className="overflow-hidden text-sm text-nowrap">
                            {currentOption ? currentOption.label : placeholder}
                        </span>
                        <ChevronDown className="h-4 w-4" />
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    className="bg-background relative w-full min-w-[var(--radix-popover-trigger-width)] p-1"
                    align="start"
                >
                    <div>
                        <div className="flex justify-end">
                            <button
                                aria-label={t('clear') + ' ' + t('select')}
                                onClick={onClearSelection}
                                className="hover:text-primary px-3 focus:outline-hidden"
                            >
                                {t('clear')}
                            </button>
                        </div>
                        {options?.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className="hover:bg-background-lighter focus:bg-background-lighter aria-selected:bg-background-lighter relative flex w-full cursor-pointer items-center justify-between rounded-xs px-3 py-1.5 text-sm outline-none select-none"
                            >
                                <span>{option.label}</span>
                                <input
                                    type="radio"
                                    checked={selectedItem === option.value}
                                    onChange={() => {}}
                                    className="ml-2 h-4 w-4 checked:bg-primary"
                                />
                            </div>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}