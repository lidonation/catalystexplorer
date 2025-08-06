import {
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
} from '@headlessui/react';
import ChevronDownIcon from './svgs/ChevronDownIcon';
import { useLaravelReactI18n } from "laravel-react-i18n";
import Checkbox from '@/Components/atoms/Checkbox';
import React, { Fragment } from 'react';

const SearchVariants = ({
    value,
    onChange,
}: {
    value: string[];
    onChange: (value: string[]) => void;
}) => {
    const { t } = useLaravelReactI18n();
    const variantItems = [
        { key: "allGroups", label: t('searchBar.variants.all') },
        { key: "proposals", label: t('proposals.proposals') },
        { key: "ideascaleProfiles", label: t('ideascaleProfiles.ideascaleProfiles') },
        { key: "groups", label: t('groups.groups') },
        { key: "communities", label: t('communities.communities') },
        { key: "wallets", label: t('wallets') },
        { key: "reviews", label: t('reviews.reviews') },
        { key: "articles", label: t('articles') },
    ];

    const allKey = "allGroups";
    const handleSelection = (newValue: string[]) => {
        if (newValue.includes(allKey) && !value.includes(allKey)) {
            onChange(variantItems.map(v => v.key));
            return;
        }

        if (!newValue.includes(allKey) && value.includes(allKey)) {
            onChange([]);
            return;
        }

        if (value.includes(allKey) && newValue.length < value.length && newValue.includes(allKey)) {
            const filteredValue = newValue.filter(item => item !== allKey);
            onChange(filteredValue);
            return;
        }

        const individualOptions = variantItems.filter(item => item.key !== allKey).map(item => item.key);
        const selectedIndividualOptions = newValue.filter(item => item !== allKey);

        if (selectedIndividualOptions.length === individualOptions.length && !newValue.includes(allKey)) {
            onChange([...newValue, allKey]);
            return;
        }

        onChange(newValue);
    };

    return (
        <div className="text-content h-full relative">
            <Listbox value={value} onChange={handleSelection} multiple>
                <ListboxButton className="flex items-center justify-center gap-3 px-3 py-2 text-nowrap">
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
                <ListboxOptions className="bg-background absolute left-0 z-50 mt-5 w-max rounded-lg shadow-xl">
    {variantItems.map((variant) => (
        <ListboxOption key={variant.key} value={variant.key} as={Fragment}>
  {({ selected }) => {
    const checkboxId = `checkbox-${variant.key}`;
    return (
      <Checkbox
        id={checkboxId}
        checked={selected}
        onChange={() => {
          const newValue = selected
            ? value.filter((v) => v !== variant.key)
            : [...value, variant.key];
          handleSelection(newValue);
        }}
        label={variant.label}
        className="h-4 w-4"
      />
    );
  }}
</ListboxOption>
    ))}
</ListboxOptions>

            </Listbox>
        </div>
    );
};

export default SearchVariants;
