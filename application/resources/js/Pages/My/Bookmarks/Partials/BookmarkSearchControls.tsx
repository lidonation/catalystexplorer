import SearchBar from "@/Components/SearchBar";
import { ProposalParamsEnum } from "@/enums/proposal-search-params";
import { useFilterContext } from "@/Context/FiltersContext";
import { useState, useEffect } from "react";

function BookmarkSearchControls() {
    const { setFilters } = useFilterContext();
    
    const queryParams = new URLSearchParams(window.location.search);
    const initialSearchQuery = queryParams.get(ProposalParamsEnum.QUERY) || '';
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

    useEffect(() => {
        setSearchQuery(initialSearchQuery);
    }, [initialSearchQuery]);

    const handleSearch = (search: string) => {
        setFilters({
            param: ProposalParamsEnum.QUERY,
            value: search,
            label: 'Search',
        });
        setSearchQuery(search);
    };

    return (
        <div className="mx-auto flex w-full flex-col gap-4 backdrop-blur-md pb-5 pt-5">
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

export default BookmarkSearchControls;
