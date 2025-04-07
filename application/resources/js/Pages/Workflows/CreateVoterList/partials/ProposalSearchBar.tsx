import TextInput from '@/Components/atoms/TextInput';
import SearchLensIcon from '@/Components/svgs/SearchLensIcon';
import useEscapeKey from '@/Hooks/useEscapeKey';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ProposalSearchBarProps {
    autoFocus?: boolean;
    showRingOnFocus?: boolean;
    handleSearch: (search: string) => void;
    focusState?: (state: boolean) => void;
    initialSearch?: string;
    className?: string;
    onClear?: () => void;
}

const ProposalSearchBar = ({
    autoFocus = false,
    showRingOnFocus = false,
    handleSearch,
    focusState,
    className = '',
    initialSearch,
    onClear,
}: ProposalSearchBarProps) => {
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const inputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();

    useEscapeKey(() => handleClear());

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    const placeholder = t('workflows.voterList.searchProposals');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setSearchQuery(newValue);
        handleSearch(newValue);
    };

    const handleClear = () => {
        setSearchQuery('');
        handleSearch('');
        onClear?.();
    };

    return (
        <div className={`w-full ${className}`}>
            <label className="relative flex items-center w-full gap-2 pl-0">
                <div className="absolute left-0 flex items-center justify-center w-10 h-full">
                    <SearchLensIcon width={16} className="text-dark" />
                </div>

                <TextInput
                    ref={inputRef}
                    placeholder={placeholder}
                    size={placeholder.length}
                    className={`w-full rounded-lg border-0 bg-background pl-10 text-content shadow-none focus:border-0 focus:border-primary ${showRingOnFocus ? 'focus:ring-2 focus:ring-primary' : 'focus:ring-0'}`}
                    value={searchQuery ?? ""}
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