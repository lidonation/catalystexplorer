import { FilteredItem, useFilterContext } from '@/Context/FiltersContext';
import BooleanFilters from './BooleanFilters';
import IDFilters from './IDFilters';
import RangeFilters from './RangeFilters';
import SortFilters from './SortFilters';
import StatusFilters from './StatusFilters';


export default function ActiveFilters({
    sortOptions,
    filters,
    setFilters,
}: {
    sortOptions?: {
        label: string;
        value: string;
    }[];
    filters: FilteredItem[];
    setFilters: (filter: FilteredItem) => void;
}) {
    const statusFilters = ['coh', 'fs', 'ps', 'ds', 'c', 'pro'];
    const rangeFilters = ['pl', 'b', 'aa', 'au', 'd', 'pr', 'vp', 'r', 'rs'];
    const sortFilters = ['st'];
    const idFilters = ['t', 'cam', 'com', 'ip', 'g', 'ri', 'f'];
    const booleanFilters = ['op', 'h'];

    return (
        <div className="flex w-full flex-wrap gap-3 text-sm transition-all duration-300">
            {filters.map((filter) => {
                if (!filter.label) {
                    return;
                }
                if (
                    statusFilters.includes(filter.param) &&
                    (filter.value.length || typeof filter.value === 'string')
                ) {
                    return (
                        <StatusFilters
                            key={filter.param}
                            filter={filter}
                            setFilters={setFilters}
                        />
                    );
                }

                if (booleanFilters.includes(filter.param)) {
                    return (
                        <BooleanFilters
                            key={filter.param}
                            filter={filter}
                            setFilters={setFilters}
                        />
                    );
                }

                if (
                    rangeFilters.includes(filter.param) &&
                    filter.value.length
                ) {
                    return (
                        <RangeFilters
                            key={filter.param}
                            filter={filter}
                            setFilters={setFilters}
                        />
                    );
                }

                if (sortFilters.includes(filter.param)) {
                    return (
                        <SortFilters
                            key={filter.param}
                            sortOptions={sortOptions}
                            filter={filter}
                            setFilters={setFilters}
                        />
                    );
                }

                if (idFilters.includes(filter.param) && filter.value.length) {
                    return (
                        <IDFilters
                            key={filter.param}
                            filter={filter}
                            setFilters={setFilters}
                        />
                    );
                }
            })}
        </div>
    );
}
