import {
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
} from '@headlessui/react';
import ChevronDownIcon from './svgs/ChevronDownIcon';
import { useTranslation } from 'react-i18next';
import {camelCase} from "@/utils/camelCase";
import Checkbox from '@/Components/atoms/Checkbox';


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
        t('ideascaleProfiles.ideascaleProfiles'),
        t('groups.groups'),
        t('communities.communities'),
        t('wallets'),
        t('reviews.reviews'),
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
        <div className="text-content h-full relative">
            <Listbox as="div" value={value} onChange={handleSelection} multiple data-testid="search-variants-dropdown">
                <ListboxButton className="flex items-center justify-center gap-3 px-3 py-2 text-nowrap" data-testid="search-variants-dropdown-button">
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
                <ListboxOptions className="bg-background absolute left-0 z-50 mt-5 w-max rounded-lg shadow-xl" data-testid="search-variants-dropdown-options">
                    {variants.map((variant) => (
                        <ListboxOption key={camelCase(variant)} value={camelCase(variant)} data-testid={`search-variant-option-${camelCase(variant)}`}>
                            {({ selected }) => (
                                <div className="hover:bg-background-lighter flex cursor-pointer items-center justify-between gap-2 px-3 py-2 hover:rounded-lg">
                                    <span className="capitalize">
                                        {variant}
                                    </span>
                                    <Checkbox
                                        id={variant}
                                        checked={selected}
                                        value={camelCase(variant)}
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

export default SearchVariants;
