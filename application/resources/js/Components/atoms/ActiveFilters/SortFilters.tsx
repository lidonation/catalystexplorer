import { FilteredItem } from '@/Context/FiltersContext';
import { router } from '@inertiajs/react';

const SortFilters = ({
    filter,
    sortOptions,
    setFilters,
}: {
    filter: FilteredItem;
    sortOptions?: {
        label: string;
        value: string;
    }[];
    setFilters: (filter: FilteredItem) => void;
}) => {
    const sort = sortOptions?.find((sort) => sort.value == filter.value);

    const removeFilter = (value?: string) => {
        setFilters({
            param: filter.param,
            value: null,
            label: undefined,
        });

        setTimeout(() => {
            const currentUrl = window.location.pathname;
            const currentParams = new URLSearchParams(window.location.search);

            const sortParams = ['st', 'sort', 'voting_power', 'time'];
            sortParams.forEach((param) => currentParams.delete(param));

            const params: Record<string, string> = {};
            for (const [key, value] of currentParams.entries()) {
                if (value) {
                    params[key] = value;
                }
            }

            router.get(currentUrl, params, {
                preserveState: true,
                preserveScroll: true,
                only: ['voterHistories', 'voters', 'filters'],
            });
        }, 10);
    };

    if (!sort) {
        return;
    }

    return (
        <div
            className="bg-background mr-1 flex items-center rounded-lg border px-1 py-1"
            key={filter.label}
        >
            <div className="mr-1">{sort?.label}</div>
            <button className="ml-2" onClick={() => removeFilter()}>
                X{' '}
            </button>
        </div>
    );
};

export default SortFilters;
