import Checkbox from '@/Components/atoms/Checkbox';
import ChevronDownIcon from '@/Components/svgs/ChevronDownIcon';
import {
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
} from '@headlessui/react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface Option {
    label: string;
    value: string;
}

const ChartFilter = ({
    value,
    variants,
    onChange,
}: {
    value: string[];
    onChange: (value: string[]) => void;
    variants: Option[];
}) => {
    const { t } = useTranslation();
    const selectedOption = variants.find((v) => v.value === value[0]);

    const prevSelectionRef = useRef<string[]>(value);

    const handleSelection = (newSelection: string[]) => {
        if (!newSelection.length) {
            onChange(['usd', 'ada']);
            return;
        }

        if (
            (newSelection.includes('usd') && newSelection.includes('ada')) ||
            newSelection.includes('all')
        ) {
            onChange(['usd', 'ada']);
            return;
        } else {
            onChange(newSelection);
            return;
        }
    };

    const allChecked = () => value.includes('usd') && value.includes('ada');

    return (
        <div className="text-content relative">
            <Listbox value={value} onChange={handleSelection} multiple>
                <ListboxButton className="border-content-light flex items-center gap-3 rounded-lg border px-3 py-1 text-nowrap lg:min-w-48">
                    {({ open }) => (
                        <div className="flex w-full items-center justify-between gap-3">
                            {allChecked()
                                ? t('allCurencies')
                                : selectedOption?.label}
                            <div
                                className={`transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
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
                            {({ selected }) => (
                                <div className="hover:bg-background-lighter flex cursor-pointer items-center justify-between gap-2 px-3 py-2 hover:rounded-lg">
                                    <span className="capitalize">
                                        {variant.label}
                                    </span>
                                    <Checkbox
                                        id={variant.value}
                                        checked={
                                            variant.value == 'all'
                                                ? allChecked()
                                                : value.includes(variant.value)
                                        }
                                        value={variant.value}
                                        onChange={() => {}}
                                        className="text-content-accent bg-background checked:bg-primary checked:hover:bg-primary focus:border-primary focus:ring-primary checked:focus:bg-primary h-4 w-4 shadow-xs focus:border"
                                    />
                                </div>
                            )}
                        </ListboxOption>
                    ))}
                </ListboxOptions>
            </Listbox>
        </div>
    );
};

export default ChartFilter;
