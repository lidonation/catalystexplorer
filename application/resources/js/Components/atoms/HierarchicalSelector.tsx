import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/Popover';
import Checkbox from '@/Components/atoms/Checkbox';
import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useLaravelReactI18n } from 'laravel-react-i18n';

export interface HierarchicalOption {
    label: string;
    value: string;
    disabled?: boolean;
    children?: HierarchicalOption[];
    isParent?: boolean;
}

type HierarchicalSelectorProps = {
    selectedItems: string[];
    setSelectedItems: (updatedItems: string[]) => void;
    options: HierarchicalOption[];
    bgColor?: string;
    className?: string;
    popoverClassName?: string;
    triggerClassName?: string;
    placeholder?: string;
    disabled?: boolean;
    customTrigger?: React.ReactNode;
    'data-testid'?: string;
    'data-testid-button'?: string;
};

export default function HierarchicalSelector({
    options,
    selectedItems = [],
    setSelectedItems,
    className,
    popoverClassName = '',
    triggerClassName = '',
    bgColor = 'bg-background',
    placeholder = 'Select options',
    disabled = false,
    customTrigger,
    'data-testid': dataTestId = 'hierarchical-selector-container',
    'data-testid-button': dataTestIdButton = 'hierarchical-selector-button',
}: HierarchicalSelectorProps) {
    const [open, setOpen] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const { t } = useLaravelReactI18n();

    const toggleExpanded = (value: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(value)) {
            newExpanded.delete(value);
        } else {
            newExpanded.add(value);
        }
        setExpandedItems(newExpanded);
    };

    const handleSelect = (value: string, hasChildren: boolean = false) => {
        if (hasChildren) {
            toggleExpanded(value);
            return;
        }

        const updatedItems = selectedItems.includes(value)
            ? selectedItems.filter(item => item !== value)
            : [...selectedItems, value];

        setSelectedItems(updatedItems);
    };

    const onClearSelection = () => {
        setSelectedItems([]);
        setOpen(false);
    };

    const renderOption = (option: HierarchicalOption, level: number = 0) => {
        const isExpanded = expandedItems.has(option.value);
        const hasChildren = option.children && option.children.length > 0;
        const isSelected = selectedItems.includes(option.value);
        const isDisabled = option.disabled;

        return (
            <div key={option.value}>
                <div
                    onClick={() => {
                        if (!isDisabled) {
                            handleSelect(option.value, hasChildren);
                        }
                    }}
                    className={cn(
                        'relative flex w-full items-center justify-between rounded-xs py-1.5 text-sm outline-hidden select-none',
                        level === 0 ? 'px-3' : level === 1 ? 'pl-7 pr-3' : level === 2 ? 'pl-11 pr-3' : 'pl-15 pr-3',
                        isDisabled 
                            ? 'text-gray-persist cursor-not-allowed opacity-70' 
                            : 'cursor-default hover:bg-background-lighter focus:bg-background-lighter'
                    )}
                    data-testid={`hierarchical-option-${option.value}`}
                >
                    <div className="flex items-center gap-2 flex-1">
                        {hasChildren && (
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpanded(option.value);
                                }}
                                className="flex items-center justify-center w-4 h-4 hover:bg-background-lighter rounded-xs"
                                dataTestId={`expand-toggle-${option.value}`}
                            >
                                {isExpanded ? (
                                    <ChevronDown className="h-3 w-3" />
                                ) : (
                                    <ChevronRight className="h-3 w-3" />
                                )}
                            </Button>
                        )}
                        
                        <Paragraph 
                            className={cn(
                                "flex-1 text-left",
                                hasChildren && "font-medium",
                                level > 0 && "text-sm opacity-80"
                            )}
                        >
                            {option.label}
                        </Paragraph>
                    </div>

                    {!hasChildren && (
                        <Checkbox
                            id={option.value}
                            checked={isSelected}
                            value={option.value}
                            onChange={() => {}}
                            className={cn(
                                'text-content-accent bg-background checked:bg-primary checked:hover:bg-primary focus:border-primary focus:ring-primary checked:focus:bg-primary ml-2 h-4 w-4 shadow-xs focus:border',
                                isDisabled && 'text-gray-persist cursor-not-allowed'
                            )}
                            disabled={isDisabled}
                            data-testid={`hierarchical-checkbox-${option.value}`}
                        />
                    )}
                </div>

                {hasChildren && isExpanded && (
                    <div className="ml-0">
                        {option.children!.map(child => renderOption(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            className={cn('h-full rounded-lg', className, bgColor)}
            data-testid={dataTestId}
        >
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    {customTrigger ? (
                        <Button
                            className={cn(triggerClassName)}
                            dataTestId={dataTestIdButton}
                            disabled={disabled}
                            ariaLabel={t('select') + ' ' + t('option')}
                            ariaExpanded={open}
                        >
                            {customTrigger}
                        </Button>
                    ) : (
                        <Button
                            className={cn(
                                'border-input placeholder:text-muted-foreground ring-offset-background flex h-full w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
                                triggerClassName,
                            )}
                            dataTestId={dataTestIdButton}
                            disabled={disabled}
                            ariaLabel={t('select') + ' ' + t('option')}
                            ariaExpanded={open}
                        >
                            <div
                                className="flex items-center gap-2 overflow-hidden"
                                data-testid="hierarchical-selected-items"
                            >
                                <Paragraph className="overflow-clip text-sm text-nowrap">
                                    {placeholder}
                                </Paragraph>
                                {selectedItems.length > 0 && (
                                    <div className="bg-background-lighter flex size-5 items-center justify-center rounded-full">
                                        <Paragraph>{selectedItems.length}</Paragraph>
                                    </div>
                                )}
                            </div>
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    )}
                </PopoverTrigger>
                <PopoverContent
                    className={cn(
                        'bg-background relative z-150 w-full min-w-[var(--radix-popover-trigger-width)] max-h-80 overflow-y-auto p-1',
                        popoverClassName,
                    )}
                    align="start"
                    data-testid="hierarchical-options-container"
                >
                    <div>
                        <div className="flex justify-end mb-2">
                            <Button
                                ariaLabel={t('clear') + ' ' + t('selection')}
                                onClick={onClearSelection}
                                className="hover:text-primary px-3 focus:outline-hidden text-xs"
                                dataTestId="hierarchical-clear-button"
                            >
                                {t('hierarchicalSelector.clear')}
                            </Button>
                        </div>
                        {options.map(option => renderOption(option))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
