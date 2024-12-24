import useEscapeKey from '@/Hooks/useEscapeKey';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TextInput from './TextInput';
import Button from './atoms/Button';
import CloseIcon from './svgs/CloseIcon';
import SearchLensIcon from './svgs/SearchLensIcon';

interface SearchBarProps {
    autoFocus?: boolean;
    showRingOnFocus?: boolean;
    handleSearch: (search: string) => void;
    focusState?: (state: boolean) => void;
    initialSearch?: string;
}

const SearchBar = ({
    autoFocus = false,
    showRingOnFocus = false,
    handleSearch,
    focusState,
    initialSearch,
}: SearchBarProps) => {
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const inputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();

    useEscapeKey(() => setSearchQuery(''));

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    const placeholder = t('searchBar.placeholder');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setSearchQuery(newValue);
        handleSearch(newValue);
    };

    return (
        <div className="w-full">
            <label className="relative flex w-full items-center gap-2 pl-0">
                <div className="absolute left-0 flex h-full w-10 items-center justify-center">
                    <SearchLensIcon width={16} className="text-content" />
                </div>

                <TextInput
                    ref={inputRef}
                    placeholder={placeholder}
                    size={placeholder.length}
                    className={`w-full rounded-lg border-0 bg-background pl-10 text-content shadow-none focus:border-0 focus:border-primary ${showRingOnFocus ? 'focus:ring-2 focus:ring-primary' : 'focus:ring-0'}`}
                    value={searchQuery}
                    onChange={handleChange}
                    onFocus={() => {
                        focusState?.(true);
                    }}
                    onBlur={() => {
                        focusState?.(false);
                    }}
                />
                <Button
                    onClick={() => setSearchQuery('')}
                    ariaLabel={t('clear')}
                    className="absolute right-0 flex h-full w-10 cursor-pointer items-center justify-center hover:text-primary"
                >
                    <CloseIcon width={16} />
                </Button>
            </label>
        </div>
    );
};

export default SearchBar;
