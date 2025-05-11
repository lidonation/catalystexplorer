import TextInput from '@/Components/atoms/TextInput';
import useEscapeKey from '@/Hooks/useEscapeKey';
import React, { useCallback, useEffect, useRef, useState, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import Button from './atoms/Button';
import CloseIcon from './svgs/CloseIcon';
import SearchLensIcon from './svgs/SearchLensIcon';
import { router } from '@inertiajs/react';

interface SearchBarProps {
    autoFocus?: boolean;
    showRingOnFocus?: boolean;
    handleSearch: (search: string) => void;
    focusState?: (state: boolean) => void;
    initialSearch?: string;
    placeholder?: string;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(({
    autoFocus = false,
    showRingOnFocus = false,
    handleSearch,
    focusState,
    initialSearch = '',
    placeholder
}: SearchBarProps, ref) => {
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const internalInputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalInputRef;

    useEscapeKey(() => handleClear());

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus, inputRef]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setSearchQuery(newValue);
        handleSearch(newValue);
    };

    const handleClear = useCallback(() => {
        setSearchQuery('');
        handleSearch('');

        router.get(window.location.pathname, {}, { replace: true });
    }, [handleSearch]);

    return (
        <div className="w-full shadow-sm rounded-md border border-gray-persist">
            <label className="relative flex w-full items-center gap-2 pl-0">
                <div className="absolute left-0 flex h-full w-10 items-center justify-center">
                    <SearchLensIcon width={16} className="text-content" />
                </div>

                <TextInput
                    ref={inputRef}
                    placeholder={placeholder}
                    size={placeholder?.length}
                    className={`bg-background text-content focus:border-primary w-full rounded-lg border-0 pl-10 shadow-none focus:border-0 ${showRingOnFocus ? 'focus:ring-primary focus:ring-2' : 'focus:ring-0'}`}
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
                    onClick={() => handleClear()}
                    ariaLabel={t('clear')}
                    className="hover:text-primary absolute right-0 flex h-full w-10 cursor-pointer items-center justify-center"
                >
                    <CloseIcon width={16} />
                </Button>
            </label>
        </div>
    );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
