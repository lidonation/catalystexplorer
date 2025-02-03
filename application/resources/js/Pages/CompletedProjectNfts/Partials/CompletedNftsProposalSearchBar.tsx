import TextInput from '@/Components/TextInput';
import SearchLensIcon from '@/Components/svgs/SearchLensIcon';
import { useFilterContext } from '@/Context/FiltersContext';
import useEscapeKey from '@/Hooks/useEscapeKey';
import { ProposalParamsEnum } from '@/enums/proposal-search-params';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
    autoFocus?: boolean;
    showRingOnFocus?: boolean;
    //handleSearch: (search: string) => void;
    focusState?: (state: boolean) => void;
    initialSearch?: string;
}

const CompletedNftsProposalSearchBar = ({
    autoFocus = false,
    showRingOnFocus = false,
    //handleSearch,
    focusState,
    initialSearch,
}: SearchBarProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();

    useEscapeKey(() => handleClear());

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    const placeholder = t(
        'completedProjectNfts.proposalsSearchBar.placeHolder',
    );

    const {setFilters } = useFilterContext();
    const queryParams = new URLSearchParams(window.location.search);
    const initialSearchQuery = queryParams.get(ProposalParamsEnum.QUERY) || '';
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

    const handleSearch = (search: string) => {
        setSearchQuery(search);
        const url = new URL(window.location.href);

        if (search.trim() === '') {
            url.searchParams.delete(ProposalParamsEnum.QUERY);
        } else {
            setFilters({
                param: ProposalParamsEnum.QUERY,
                value: search,
                label: 'Search',
            });
            url.searchParams.set(ProposalParamsEnum.QUERY, search);
        }

        window.history.replaceState(null, '', url.toString());
    };

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
        <div className="w-full">
            <label className="relative flex w-full items-center gap-2 pl-0">
                <div className="absolute left-0 flex h-full w-10 items-center justify-center">
                    <SearchLensIcon width={16} className="text-dark" />
                </div>

                <TextInput
                    ref={inputRef}
                    placeholder={placeholder}
                    size={placeholder.length}
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
            </label>
        </div>
    );
};

export default CompletedNftsProposalSearchBar;
