import SearchBar from '@/Components/SearchBar';
import { useFilterContext } from '@/Context/FiltersContext';
import { ProposalParamsEnum } from '@/enums/proposal-search-params';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProposalSearchParams } from '../../../../types/proposal-search-params';

function IdeascaleProfilesSearchControls() {
    const { filters, setFilters } = useFilterContext();
    const { t } = useTranslation();

    const queryParams = new URLSearchParams(window.location.search);
    const initialSearchQuery = queryParams.get(ProposalParamsEnum.QUERY) || '';
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

    useEffect(() => {
        setSearchQuery(initialSearchQuery);
    }, [initialSearchQuery]);

    const handleSearch = (search: string) => {
        setSearchQuery(search); 
        const url = new URL(window.location.href);
    
        if (search.trim() === '') {
            url.searchParams.delete(ProposalParamsEnum.QUERY);
        } else {
            setFilters({param:ProposalParamsEnum.QUERY, value:search,label:'Search'});
            url.searchParams.set(ProposalParamsEnum.QUERY, search);
        }
    
        window.history.replaceState(null, '', url.toString());
    };
    
    
    return (
        <div className="mx-auto flex w-full flex-col gap-4 bg-background-lighter pb-4 pt-6">
            <div className="flex items-center justify-end gap-2">
                <SearchBar
                    handleSearch={handleSearch}
                    autoFocus
                    showRingOnFocus
                    initialSearch={searchQuery}
                />
            </div>
        </div>
    );
}

export default  IdeascaleProfilesSearchControls;
