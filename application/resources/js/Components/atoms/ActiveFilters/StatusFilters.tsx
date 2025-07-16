import { FilteredItem } from '@/Context/FiltersContext';
import fromSnakeCase from '@/utils/fromSnakecase';

const StatusFilters = ({
    filter,
    setFilters,
}: {
    filter: FilteredItem;
    setFilters: (filter: FilteredItem) => void;
}) => {
    const removeFilter = (value?: string) => {
        const currentValue = Array.isArray(filter.value)
            ? filter.value
            : String(filter.value).split(',');

        const newVal = currentValue.filter(
            (val: string | undefined) => val != value,
        );

        setFilters({
            param: filter.param,
            value: newVal,
            label: filter.label,
        });
    };

    const values = Array.isArray(filter.value)
        ? filter.value
        : String(filter.value).split(',');

    return (
        <div
            className="bg-background mr-1 flex items-center rounded-lg border px-1 py-1"
            key={filter.label}
            data-testid={`status-filter-${filter.param}`}
        >
            <div className="mr-1 font-bold">{filter.label}:</div>
            <div className="mr-1 flex items-center gap-2">
                {values?.map((value: string) => (
                    <div key={value} className="flex items-center">
                        <span>{fromSnakeCase(value)}</span>
                        <button
                            className="ml-2"
                            onClick={() => removeFilter(value)}
                            data-testid={`remove-status-filter-${value}`}
                        >
                            X{' '}
                        </button>{' '}
                    </div>
                ))}
            </div>
        </div>
    );
};


export default StatusFilters;
