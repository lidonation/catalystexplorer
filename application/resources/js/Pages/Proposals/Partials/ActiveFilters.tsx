import { useFilterContext } from '@/Context/FiltersContext';
import { useState } from 'react';

function formatSnakeCaseToTitleCase(input: string) {
    return input
        ?.split('_')
        .map(
            (word: string) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(' ');
}
export default function ActiveFilters() {
    const { filters, setFilters } = useFilterContext();
    const [selectedFilters, setSelectedFilters] = useState<any>({});
    const [clearFilter, setClearFilter] = useState(true);

    const labels = {
        b: 'Budgets',
        f: 'Funds',
        fs: 'Funding Status',
        pl: 'Project Length',
        ps: 'Project Status',
        op: 'Opensource',
        t: 'Tags',
        cam: 'Campaign',
        coh: 'Cohort',
        com: 'Communities',
        ip: 'Ideascale Profiles',
        g: 'Groups',
    };

    const statusFilters = ['coh', 'fs', 'ps'];
    const rangeFilters = ['pl', 'b'];
    const idFilters = ['t', 'cam', 'com', 'ip', 'g'];
    const booleanFilters = ['op'];

    const removeFilter = (key: string, value?: string) => {
        // const filterKey = getKey(key);
        // setSelectedFilters(newFilters);
    };

    const handleClearFilter = () => {
        setClearFilter(!clearFilter);
    };

    return (
        <div className="flex w-full flex-wrap pt-2">
            {filters.map(
                (filter) => filter.label && <StatusFilters filter={filter} />,
            )}
        </div>
    );
}

const StatusFilters = ({ filter }) => {
    return (
        <div
            className="mb-1 mr-1 flex items-center rounded-lg border bg-background px-1 py-1"
            key={filter.label}
        >
            <div className="mr-1 font-bold">{filter.label}:</div>
            <div className="mr-1 flex items-center gap-2">
                {' '}
                {filter.value.map((value: string) => (
                    <div key={value} className="flex items-center">
                        {' '}
                        <span>{formatSnakeCaseToTitleCase(value)}</span>
                        <button className="ml-2" onClick={() => null}>
                            X{' '}
                        </button>{' '}
                    </div>
                ))}
            </div>
        </div>
    );
};


const RangeFilters = (filter) => {};

const BooleanFilters = (filter) => {};

const IDFilters = () => {};
