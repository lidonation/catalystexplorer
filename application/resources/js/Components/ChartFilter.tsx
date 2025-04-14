import Checkbox from '@/Components/atoms/Checkbox';
import ChevronDownIcon from '@/Components/svgs/ChevronDownIcon';
import {
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
} from '@headlessui/react';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

interface Option {
    label: string;
    value: string;
    selected: boolean;
}

const ChartFilter = ({
    value,
    variants,
    onChange,
}: {
    value: string[];
    onChange: Dispatch<SetStateAction<string[]>>;
    variants: Option[];
}) => {
    const { t } = useTranslation();

    const allChecked = () => {
        return value.includes('all');
    };

    const selected = variants.filter((item) => value.includes(item.value));

    const toggleValue = (value: string, checked: boolean) => {
        onChange((prev: string[]) => {
            const isAll = value === 'all';
            const allOptions = ['all', 'usd', 'ada'];

            if (isAll) {
                return allOptions;
            }

            let next = checked
                ? [...new Set([...prev.filter((v) => v !== 'all'), value])]
                : prev.filter((v) => v !== value && v !== 'all');

            // Prevent deselecting all
            if (next.length === 0) {
                return prev;
            }

            const currenciesOnly = allOptions.filter((f) => f !== 'all');
            const allSelected = currenciesOnly.every((cur) =>
                next.includes(cur),
            );

            if (allSelected) {
                next = ['all', ...currenciesOnly];
            }

            return next;
        });
    };

    return (
        <div className="text-content relative">
            <Listbox value={value} multiple>
                <ListboxButton className="border-content-light flex items-center gap-3 rounded-lg border px-3 py-1 text-nowrap lg:min-w-48">
                    {({ open }) => (
                        <div className="flex w-full items-center justify-between gap-3">
                            {allChecked()
                                ? t('allCurrencies')
                                : selected?.[0].label}
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
                            <label
                                htmlFor={variant.value}
                                className="hover:bg-background-lighter flex cursor-pointer items-center justify-between gap-2 px-3 py-2 hover:rounded-lg"
                            >
                                <span className="capitalize">
                                    {variant.label}
                                </span>
                                <Checkbox
                                    id={variant.value}
                                    checked={variant.selected}
                                    onClick={(e) =>
                                        toggleValue(
                                            variant.value,
                                            (e.target as HTMLInputElement)
                                                .checked,
                                        )
                                    }
                                    className="text-content-accent bg-background checked:bg-primary checked:hover:bg-primary focus:border-primary focus:ring-primary checked:focus:bg-primary h-4 w-4 shadow-xs focus:border"
                                />
                            </label>
                        </ListboxOption>
                    ))}
                </ListboxOptions>
            </Listbox>
        </div>
    );
};
export default ChartFilter;
