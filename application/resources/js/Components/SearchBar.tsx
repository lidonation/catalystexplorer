import useEnterKey from '@/Hooks/useEnterKey';
import useEscapeKey from '@/Hooks/useEscapeKey';
import {
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
} from '@headlessui/react';
import { router } from '@inertiajs/react';
import { TFunction } from 'i18next';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Checkbox from './Checkbox';
import TextInput from './TextInput';
import ChevronDownIcon from './svgs/ChevronDownIcon';
import SearchLensIcon from './svgs/SearchLensIcon';

const SearchVariants = ({
    value,
    onChange,
    translation,
}: {
    value: string[];
    onChange: (value: string[]) => void;
    translation: TFunction<'translation', undefined>;
}) => {
    const variants = [
        translation('searchBar.variants.all'),
        translation('searchBar.variants.proposals'),
        translation('searchBar.variants.people'),
        translation('searchBar.variants.groups'),
        translation('searchBar.variants.communities'),
        translation('searchBar.variants.wallets'),
        translation('searchBar.variants.reviews'),
        translation('searchBar.variants.articles'),
    ];
    const handleSelection = (newValue: string[]) => {
        if (
            newValue.includes(translation('searchBar.variants.all')) &&
            !value.includes(translation('searchBar.variants.all'))
        ) {
            onChange(variants);
            return;
        }

        if (
            !newValue.includes(translation('searchBar.variants.all')) &&
            value.includes(translation('searchBar.variants.all'))
        ) {
            onChange([]);
            return;
        }

        if (
            value.includes(translation('searchBar.variants.all')) &&
            newValue.length < value.length
        ) {
            onChange(
                newValue.filter(
                    (item) => item !== translation('searchBar.variants.all'),
                ),
            );
            return;
        }
        if (
            newValue.length === variants.length - 1 &&
            !newValue.includes(translation('searchBar.variants.all'))
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
                            {translation('searchBar.all_filters')}
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
                                <div className="flex cursor-pointer items-center justify-between gap-2 px-3 py-2 hover:rounded-lg hover:bg-hover">
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

interface SearchBarProps {
    autoFocus?: boolean;
}

const SearchBar = ({ autoFocus = false }: SearchBarProps) => {
    const [searchTerms, setSearchTerms] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();
    const escapeHandler = () => setSearchQuery('');
    const enterHandler = () => {
        const syntheticEvent = new Event('submit', {
            bubbles: true,
            cancelable: true,
        });
        handleSearch(syntheticEvent as unknown as React.FormEvent);
    };

    useEscapeKey(escapeHandler);
    useEnterKey(enterHandler);

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    const placeholder = t('searchBar.placeholder');

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        const filters = searchTerms
            .filter((term) => term !== t('searchBar.variants.all'))
            .join(',');

        router.get(
            '/s',
            {
                q: searchQuery,
                f: filters,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <form
            onSubmit={handleSearch}
            className={`flex items-center rounded-lg bg-background transition-all duration-200 ${
                isFocused ? 'border-primary ring-2 ring-primary' : ''
            }`}
        >
            <SearchVariants
                value={searchTerms}
                onChange={setSearchTerms}
                translation={t}
            />

            <label
                className={`relative flex items-center gap-2 border-l-2 pl-0 ${isFocused ? 'border-primary' : 'border-border'} }`}
            >
                <div className="absolute left-0 flex h-full w-10 items-center justify-center">
                    <SearchLensIcon width={16} className="text-content" />
                </div>
                <TextInput
                    ref={inputRef}
                    placeholder={placeholder}
                    size={placeholder.length}
                    className="w-full rounded-lg border-0 bg-background pl-10 text-content shadow-none focus:border-0 focus:border-primary focus:ring-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
            </label>
        </form>
    );
};

export default SearchBar;
