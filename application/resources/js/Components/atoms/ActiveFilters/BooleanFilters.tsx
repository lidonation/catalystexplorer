import { FilteredItem } from '@/Context/FiltersContext';

const BooleanFilters = ({
    filter,
    setFilters,
}: {
    filter: FilteredItem;
    setFilters: (filter: FilteredItem) => void;
}) => {
    const removeFilter = (value?: string) => {
        setFilters({
            param: filter.param,
            value: null,
            label: undefined,
        });
    };
    return (
        <div
            className="bg-background mr-1 flex items-center rounded-lg border px-1 py-1"
            key={filter.label}
            data-testid={`boolean-filter-${filter.param}`}
        >
            <div className="mr-1 font-bold">{filter.label}:</div>
            <button className="ml-2" onClick={() => removeFilter()} data-testid={`remove-boolean-filter-${filter.param}`}>
                X{' '}
            </button>
        </div>
    );
};

export default BooleanFilters;
