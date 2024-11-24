'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

interface SelectProps {
    isMultiselect?: boolean;
    selectedItems: string[];
    onChange: (items: string[]) => void;
    children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({
    isMultiselect = false,
    selectedItems,
    onChange,
    children,
    ...props
}) => {
    const handleSelectChange = (value: string) => {
        const updatedItems = isMultiselect
            ? selectedItems.includes(value)
                ? selectedItems.filter((item) => item !== value)
                : [...selectedItems, value]
            : [value];

        onChange(updatedItems);
    };

    return (
        <SelectPrimitive.Root
            value={isMultiselect ? undefined : selectedItems[0]}
            onValueChange={handleSelectChange}
            {...props}
        >
            {React.Children.map(children, (child) => {
                if (
                    React.isValidElement(child) &&
                    child.type === SelectContent
                ) {
                    return React.cloneElement(child, {
                        isMultiselect,
                        selectedItems,
                    });
                }
                return child;
            })}
        </SelectPrimitive.Root>
    );
};

const SelectTrigger = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
            'border-input placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
            className,
        )}
        {...props}
    >
        {children}
        <SelectPrimitive.Icon asChild>
            <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
        isMultiselect?: boolean;
        selectedItems?: string[];
    }
>(
    (
        {
            className,
            children,
            isMultiselect = false,
            selectedItems = [],
            ...props
        },
        ref,
    ) => (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                ref={ref}
                className={cn(
                    'text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md bg-background',
                    className,
                )}
                {...props}
            >
                <SelectScrollUpButton />
                <SelectPrimitive.Viewport className="p-1">
                    {React.Children.map(children, (child) => {
                        if (
                            React.isValidElement(child) &&
                            child.type === SelectItem
                        ) {
                            return React.cloneElement(child, {
                                isMultiselect,
                                selectedItems,
                            });
                        }
                        return child;
                    })}
                </SelectPrimitive.Viewport>
                <SelectScrollDownButton />
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    ),
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
        isMultiselect?: boolean;
        selectedItems?: string[];
    }
>(
    (
        {
            className,
            children,
            isMultiselect = false,
            selectedItems = [],
            value,
            ...props
        },
        ref,
    ) => {
        const isSelected = selectedItems.includes(value);

        return (
            <SelectPrimitive.Item
                ref={ref}
                value={value}
                className={cn(
                    'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-background-lighter data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                    className,
                )}
                {...props}
            >
                {isMultiselect && (
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                        {isSelected && <Check className="h-4 w-4" />}
                    </span>
                )}
                <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
            </SelectPrimitive.Item>
        );
    },
);
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectScrollUpButton = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollUpButton
        ref={ref}
        className={cn(
            'flex cursor-default items-center justify-center py-1',
            className,
        )}
        {...props}
    >
        <ChevronUp className="h-4 w-4" />
    </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollDownButton
        ref={ref}
        className={cn(
            'flex cursor-default items-center justify-center py-1',
            className,
        )}
        {...props}
    >
        <ChevronDown className="h-4 w-4" />
    </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
    SelectPrimitive.ScrollDownButton.displayName;

export {
    Select,
    SelectContent,
    SelectItem,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectTrigger,
};
