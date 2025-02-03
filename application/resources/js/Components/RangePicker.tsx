'use client';

import { cn } from '@/lib/utils';
import { shortNumber } from '@/utils/shortNumber';
import * as SliderPrimitive from '@radix-ui/react-slider';
import React, { useState } from 'react';

type RangePickerProps = {
    context?: string;
    value?: number[];
    defaultValue: number[];
    onValueChange?: (value: number[]) => void;
} & React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>;

const RangePicker = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    RangePickerProps
>(
    (
        {
            className,
            context = '',
            value,
            defaultValue,
            onValueChange,
            ...props
        },
        ref,
    ) => {
        const [localValue, setLocalValue] = useState<number[]>(defaultValue);

        const handleValueChange = (newValue: number[]) => {
            if (!value) setLocalValue(newValue);
            onValueChange?.(newValue);
        };

        const currentValue = value ?? localValue??[];

        return (
            <div className="flex flex-col">
                <span className="mb-4">{context}</span>
                <SliderPrimitive.Root
                    ref={ref}
                    className={cn(
                        'relative flex w-full touch-none items-center select-none',
                        className,
                    )}
                    value={currentValue}
                    onValueChange={handleValueChange}
                    {...props}
                >
                    <SliderPrimitive.Track className="bg-content-light relative h-2 w-full grow overflow-hidden rounded-full">
                        <SliderPrimitive.Range className="bg-primary absolute h-full" />
                    </SliderPrimitive.Track>
                    {currentValue &&
                        currentValue.map((_, index) => (
                            <SliderPrimitive.Thumb
                                key={index}
                                className="focus-visible:ring-ring border-primary bg-background ring-offset-background block h-5 w-5 rounded-full border-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
                            />
                        ))}
                </SliderPrimitive.Root>
                <div className="mt-2 flex justify-between text-sm font-bold">
                    <strong>{shortNumber(currentValue?.[0])}</strong>
                    <strong>{shortNumber(currentValue?.[1])}</strong>
                </div>
            </div>
        );
    },
);
RangePicker.displayName = SliderPrimitive.Root.displayName;

export { RangePicker };
