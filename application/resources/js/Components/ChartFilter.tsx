import Checkbox from '@/Components/atoms/Checkbox';
import ChevronDownIcon from '@/Components/svgs/ChevronDownIcon';
import {
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
} from '@headlessui/react';
import { Dispatch, forwardRef, SetStateAction, useEffect } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";

interface Option {
    label: string;
    value: string;
    selected: boolean;
}

const ChartFilter = forwardRef<
    HTMLDivElement,
    {
        value: string[];
        onChange: Dispatch<SetStateAction<string[]>>;
        variants: Option[];
    }
>(({ value, variants, onChange }, ref) => {
    const { t } = useLaravelReactI18n();

    useEffect(() => {
        if (value.length === 0 && variants.length > 0) {
            onChange([variants[0].value]);
        }
    }, [value, variants, onChange]);

    const selectedValue = value[0] ?? variants[0]?.value;

    const toggleValue = (val: string) => {
        onChange([val]);
    };

    return (
        <div ref={ref} className="text-content relative">
            <Listbox
                as="div"
                value={selectedValue}
                onChange={(val) => toggleValue(val)}
            >
                <ListboxButton className="border-content-light flex items-center gap-3 rounded-lg border px-3 py-1 text-nowrap lg:min-w-48">
                    {({ open }) => (
                        <div className="flex w-full items-center justify-between gap-3">
                            {
                                variants.find((v) => v.value === selectedValue)
                                    ?.label
                            }
                            <div
                                className={`transform transition-transform duration-200 ${
                                    open ? 'rotate-180' : ''
                                }`}
                            >
                                <ChevronDownIcon width={10} />
                            </div>
                        </div>
                    )}
                </ListboxButton>

                <ListboxOptions className="bg-background absolute right-0 z-50 mt-5 w-max rounded-lg shadow-xl">
                    {variants.map((variant) => (
                        <ListboxOption
                            key={variant.value}
                            value={variant.value}
                        >
                            {() => (
                                <label
                                    htmlFor={variant.value}
                                    className="hover:bg-background-lighter flex cursor-pointer items-center justify-between gap-2 px-3 py-2 hover:rounded-lg"
                                >
                                    <span className="capitalize">
                                        {variant.label}
                                    </span>
                                    <Checkbox
                                        label={`Select ${variant.label}`}
                                        id={variant.value}
                                        checked={
                                            selectedValue === variant.value
                                        }
                                        onChange={() =>
                                            toggleValue(variant.value)
                                        }
                                        className="text-content-accent bg-background checked:bg-primary checked:hover:bg-primary focus:border-primary focus:ring-primary checked:focus:bg-primary h-4 w-4 shadow-xs focus:border"
                                    />
                                </label>
                            )}
                        </ListboxOption>
                    ))}
                </ListboxOptions>
            </Listbox>
        </div>
    );
});

export default ChartFilter;

