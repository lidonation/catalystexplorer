import SearchBar from "@/Components/SearchBar";
import { ProposalParamsEnum } from "@/enums/proposal-search-params";
import { useState } from "react";

function BookmarkSearchControls() {
    const queryParams = new URLSearchParams(window.location.search);
    const initialSearchQuery = queryParams.get(ProposalParamsEnum.QUERY) || '';
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

    const handleSearch = (search: string) => {
        
    }

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

export default BookmarkSearchControls;
