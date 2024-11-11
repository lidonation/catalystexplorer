import {
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
} from '@headlessui/react';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import Checkbox from './Checkbox';
import TextInput from './TextInput';
import SearchLensIcon from './svgs/SearchLensIcon';
import ChevronDownIcon from './svgs/ChevronDownIcon';
import useEscapeKey from '@/Hooks/useEscapeKey';
import useEnterKey from '@/Hooks/useEnterKey';

const variants = [
    'all groups',
    'proposals',
    'people',
    'groups',
    'wallets',
    'communities',
    'reviews',
    'articles',
];

const SearchVariants = ({ value, onChange }: { value: string[], onChange: (value: string[]) => void }) => {
    const handleSelection = (newValue: string[]) => {
        if (newValue.includes('all groups') && !value.includes('all groups')) {
            onChange(variants);
            return;
        }

        if (!newValue.includes('all groups') && value.includes('all groups')) {
            onChange([]);
            return;
        }

        if (value.includes('all groups') && newValue.length < value.length) {
            onChange(newValue.filter(item => item !== 'all groups'));
            return;
        }

        if (newValue.length === variants.length - 1 && !newValue.includes('all groups')) {
            onChange(variants);
            return;
        }

        onChange(newValue);
    };

    return (
        <div className="relative text-content-primary">
            <Listbox value={value} onChange={handleSelection} multiple>
                <ListboxButton className="text-nowrap flex gap-3 items-center justify-center px-3">
                    {({ open }) => (
                        <div className='flex items-center gap-3'>
                            All Filters
                            <div className={`transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
                                <ChevronDownIcon width={10} />
                            </div>
                        </div>
                    )}
                </ListboxButton>
                <ListboxOptions className="bg-background-primary shadow-xl rounded-lg absolute left-0 w-max mt-5 z-50">
                    {variants.map((variant) => (
                        <ListboxOption key={variant} value={variant}>
                            {({ selected }) => (
                                <div className="flex items-center gap-2 px-3 py-2 hover:bg-content-hover hover:rounded-lg cursor-pointer justify-between">
                                    <span className="capitalize">{variant}</span>
                                    <Checkbox
                                        id={variant}
                                        checked={selected}
                                        value={variant}
                                        onChange={() => {}}
                                        className='checked:bg-primary-100'
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

const SearchBar = () => {
    const [searchTerms, setSearchTerms] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const escapeHandler = () => setSearchQuery('');
    const enterHandler = () => {
        const syntheticEvent = new Event('submit', {
            bubbles: true,
            cancelable: true
        });
        handleSearch(syntheticEvent as unknown as React.FormEvent);
    };

    useEscapeKey(escapeHandler);
    useEnterKey(enterHandler);

    const placeholder = "Search proposals, funds, people, articles & data";

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        const filters = searchTerms.filter(term => term !== 'all groups').join(',');
        
        router.get('/s', {
            q: searchQuery,
            f: filters,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={handleSearch} className="flex items-center bg-background-primary rounded-lg">
            <SearchVariants value={searchTerms} onChange={setSearchTerms} />
            <label className="flex items-center gap-2 pl-2 border-l">
                <div>
                    <SearchLensIcon width={16} />
                </div>
                <TextInput
                    placeholder={placeholder}
                    size={placeholder.length}
                    className="border-none rounded-lg shadow-none w-full bg-background-primary text-content-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </label>
        </form>
    );
};

export default SearchBar;