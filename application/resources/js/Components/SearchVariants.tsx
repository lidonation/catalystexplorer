import {
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
} from '@headlessui/react';
import Checkbox from './Checkbox';
import ChevronDownIcon from './svgs/ChevronDownIcon';
import { useTranslation } from 'react-i18next';

const SearchVariants = ({
    value,
    onChange,
}: {
    value: string[];
    onChange: (value: string[]) => void;
}) => {
    const { t } = useTranslation();
    const variants = [
        t('searchBar.variants.all'),
        t('proposals.proposals'),
        t('people'),
        t('groups'),
        t('communities'),
        t('wallets'),
        t('reviews'),
        t('articles'),
    ];
    const handleSelection = (newValue: string[]) => {
        if (
            newValue.includes(t('searchBar.variants.all')) &&
            !value.includes(t('searchBar.variants.all'))
        ) {
            onChange(variants);
            return;
        }

        if (
            !newValue.includes(t('searchBar.variants.all')) &&
            value.includes(t('searchBar.variants.all'))
        ) {
            onChange([]);
            return;
        }

        if (
            value.includes(t('searchBar.variants.all')) &&
            newValue.length < value.length
        ) {
            onChange(
                newValue.filter(
                    (item) => item !== t('searchBar.variants.all'),
                ),
            );
            return;
        }
        if (
            newValue.length === variants.length - 1 &&
            !newValue.includes(t('searchBar.variants.all'))
        ) {
            onChange(variants);
            return;
        }

        onChange(newValue);
    };

    return (
        <div className="relative text-content">
            <Listbox value={value} onChange={handleSelection} multiple>
                <ListboxButton className="flex items-center justify-center gap-3 text-nowrap px-3">
                    {({ open }) => (
                        <div className="flex items-center gap-3">
                            {t('searchBar.all_filters')}
                            <div
                                className={`transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                            >
                                <ChevronDownIcon width={10} />
                            </div>
                        </div>
                    )}
                </ListboxButton>
                <ListboxOptions className="absolute left-0 z-50 mt-5 w-max rounded-lg bg-background shadow-xl">
                    {variants.map((variant) => (
                        <ListboxOption key={variant} value={variant}>
                            {({ selected }) => (
                                <div className="flex cursor-pointer items-center justify-between gap-2 px-3 py-2 hover:rounded-lg hover:bg-background-lighter">
                                    <span className="capitalize">
                                        {variant}
                                    </span>
                                    <Checkbox
                                        id={variant}
                                        checked={selected}
                                        value={variant}
                                        onChange={() => {}}
                                        className="checked:bg-primary"
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

export default SearchVariants;
