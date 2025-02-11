import Button from '@/Components/atoms/Button';
import SearchBar from '@/Components/SearchBar';
import Selector from '@/Components/atoms/Selector';
import FilterLinesIcon from '@/Components/svgs/FilterLinesIcon';
import { useFilterContext } from '@/Context/FiltersContext';
import { ProposalParamsEnum } from '@/enums/proposal-search-params';
import ProposalSortingOptions from '@/lib/ProposalSortOptions';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ActiveFilters from '@/Pages/Proposals/Partials/ActiveFilters';
import GroupSortingOptions from '@/lib/GroupSortOptions';

function GroupSearchControls({
    onFiltersToggle,
}: {
    onFiltersToggle: Dispatch<SetStateAction<boolean>>;
}) {
    const { getFilter, setFilters, filters } = useFilterContext();
    const { t } = useTranslation();

    const queryParams = new URLSearchParams(window.location.search);
    const initialSearchQuery = queryParams.get(ProposalParamsEnum.QUERY) || '';
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [showFilters, setShowFilters] = useState(false);

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

    const toggleFilters = () => {
        setShowFilters((prev) => !prev);
        onFiltersToggle(showFilters);
    };

    const filtersCount = filters.filter(
        (filter) =>
            filter.param !== ProposalParamsEnum.PAGE && filter.value.length > 0,
    ).length;

    return (
        <div className="sticky top-0 z-10 container mx-auto flex w-full flex-col gap-3 py-3 backdrop-blur-md">
            <div className="flex items-center justify-end gap-2">
                <SearchBar
                    handleSearch={handleSearch}
                    autoFocus
                    showRingOnFocus
                    initialSearch={searchQuery}
                />
                <Button
                    className={`border-input bg-background flex flex-row items-center gap-2 rounded-lg border px-3 py-1.5 shadow-xs cursor-pointer ${
                        showFilters
                            ? 'border-accent-blue text-primary ring-offset-background ring-1'
                            : 'hover:bg-background-lighter text-gray-500'
                    }`}
                    onClick={() => toggleFilters()}
                >
                    <FilterLinesIcon className={'size-6'} />
                    <span>{t('filters')}</span>
                    <span>({filtersCount})</span>
                </Button>

                <Selector
                    isMultiselect={false}
                    selectedItems={getFilter(ProposalParamsEnum.SORTS)}
                    setSelectedItems={(value) =>
                        setFilters({
                            param: ProposalParamsEnum.SORTS,
                            value,
                            label: 'Sorts',
                        })
                    }
                    options={GroupSortingOptions()}
                    hideCheckbox={true}
                    placeholder={t('proposals.options.sort')}
                    className={`bg-background ${
                        getFilter(ProposalParamsEnum.SORTS)
                            ? 'bg-background-lighter text-primary cursor-default'
                            : 'hover:bg-background-lighter text-gray-500'
                    }`}
                />
            </div>

            <div className="container mx-auto flex justify-start px-0">
                <ActiveFilters sortOptions={GroupSortingOptions()} />
            </div>
        </div>
    );
}

export default GroupSearchControls;
