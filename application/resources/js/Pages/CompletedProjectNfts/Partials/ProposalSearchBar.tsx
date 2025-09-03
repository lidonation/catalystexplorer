import TextInput from '@/Components/atoms/TextInput';
import SearchLensIcon from '@/Components/svgs/SearchLensIcon';
import useEscapeKey from '@/Hooks/useEscapeKey';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useRef, useState } from 'react';

export interface SearchBarProps {
    autoFocus?: boolean;
    showRingOnFocus?: boolean;
    handleSearch: (search: string) => void;
    focusState?: (state: boolean) => void;
    initialSearch?: string;
    className?: string;
}

const ProposalSearchBar = ({
    autoFocus = false,
    showRingOnFocus = false,
    handleSearch,
    focusState,
    className = '',
    initialSearch,
}: SearchBarProps) => {
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const inputRef = useRef<HTMLInputElement>(null);
    const { t } = useLaravelReactI18n();

    useEscapeKey(() => handleClear());

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    const placeholder = t(
        'completedProjectNfts.proposalsSearchBar.placeHolder',
    );

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setSearchQuery(newValue);
        handleSearch(newValue);
    };

    const handleClear = () => {
        setSearchQuery('');
        handleSearch('');
    };

    return (
        <div className={`w-full ${className}`}>
            <label className="relative flex w-full items-center gap-2 pl-0">
                <div className="absolute left-0 flex h-full w-10 items-center justify-center">
                    <SearchLensIcon width={16} className="text-dark" />
                </div>

                <TextInput
                    ref={inputRef}
                    placeholder={placeholder}
                    size={placeholder.length}
                    className={`bg-background text-content focus:border-primary w-full rounded-lg pl-10 shadow-none focus:border-0 ${showRingOnFocus ? 'focus:ring-primary focus:ring-2' : 'focus:ring-0'}`}
                    value={searchQuery ?? ''}
                    onChange={handleChange}
                    onFocus={() => {
                        focusState?.(true);
                    }}
                    onBlur={() => {
                        focusState?.(false);
                    }}
                />
            </label>
        </div>
    );
};

export default ProposalSearchBar;
