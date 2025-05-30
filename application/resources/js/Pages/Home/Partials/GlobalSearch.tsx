import SearchBar from '@/Components/SearchBar';
import SearchVariants from '@/Components/SearchVariants';
import useEnterKey from '@/Hooks/useEnterKey';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function GlobalSearch() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchFilters, setSearchFilters] = useState<string[]>([]);
    const [isFocused, setIsFocused] = useState(false);

    const { t } = useTranslation();

    const enterHandler = () => {
        const syntheticEvent = new Event('submit', {
            bubbles: true,
            cancelable: true,
        });
        submit(syntheticEvent as unknown as React.FormEvent);
    };

    useEnterKey(enterHandler);

    const handleSearch = (newTerm: string) => {
        setSearchTerm(newTerm);
    };

    const handleFocusState = (state: boolean) => {
        setIsFocused(state);
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        const filters = searchFilters
            .filter((term) => term !== t('searchBar.variants.all'))
            .map((term) => term.toLowerCase())
            .join(',');

        const queryParams: Record<string, string> = { q: searchTerm };

        if (filters) queryParams.f = filters;

        router.get('/s', queryParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };
    return (
        <form
            onSubmit={submit}
            className={`divide-gray-light divide-border bg-background flex items-center divide-x-2 rounded-lg transition-all duration-200 ${
                isFocused ? 'ring-primary ring-3' : ''
            }`}
        >
            <SearchVariants value={searchFilters} onChange={setSearchFilters} />

            <SearchBar
                handleSearch={handleSearch}
                focusState={handleFocusState}
                autoFocus
                placeholder={t('searchBar.placeholder')}
            />
        </form>
    );
}

export default GlobalSearch;
