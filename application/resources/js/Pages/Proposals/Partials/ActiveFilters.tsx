import { useFilterContext } from '@/Context/FiltersContext';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProposalSearchParams } from '../../../../types/proposal-search-params';

export default function ActiveFilters() {
    const { filters, setFilters } = useFilterContext<ProposalSearchParams>();
    const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({});
    const [clearFilter, setClearFilter] = useState(true);

    const labels: Record<string, string> = {
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

    const formatSnakeCaseToTitleCase = (input: string) =>
        input
            ?.split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

    const filterCategories = {
        statusFilters: ['coh', 'fs', 'ps'],
        rangeFilters: ['pl', 'b'],
        idFilters: ['t', 'cam', 'com', 'ip', 'g'],
        booleanFilters: ['op'],
    };

    useEffect(() => {
        const updatedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
            const label = labels[key];
            if (!label) return acc;

            if (filterCategories.statusFilters.includes(key)) {
                acc[label] = value.map(formatSnakeCaseToTitleCase);
            } else if (filterCategories.rangeFilters.includes(key) || filterCategories.idFilters.includes(key)) {
                acc[label] = Array.isArray(value) ? value.join(', ') : value;
            } else if (filterCategories.booleanFilters.includes(key)) {
                acc[label] = !!parseInt(value);
            } else {
                acc[label] = value;
            }
            return acc;
        }, {});

        setSelectedFilters(updatedFilters);
    }, [filters]);

    const { t } = useTranslation();

    const removeFilter = (key: string, value?: string) => {
        const newFilters = { ...filters };
        if (value) {
            newFilters[key] = Array.isArray(newFilters[key]) ? newFilters[key].filter((item) => item !== value) : [];
        } else {
            newFilters[key] = [];
        }
        setFilters(newFilters, 'remove');
    };

    const handleClearFilter = (key: string) => {
        const newFilters = { ...filters };
        delete newFilters[key];
        setFilters(newFilters, 'clear');
    };
    return (
        <div className="pt-2 flex flex-wrap">
            {Object.entries(selectedFilters).map(([key, values]) => (
                <div className="bg-background border rounded-md flex items-center px-1 py-1 mr-1 mb-1" key={key}>
                    <div className="font-bold mr-1">{key}:</div>
                    <div className="mr-1">
                        {Array.isArray(values) ? (
                            values.map((value) =>
                                clearFilter ? (
                                    <div key={value} className="flex items-center">
                                        <span>{value}</span>
                                        <button className="ml-2" onClick={() => removeFilter(key, value)}>
                                            X
                                        </button>
                                    </div>
                                ) : null
                            )
                        ) : (
                            values
                        )}
                    </div>
                    {!Array.isArray(values) && (
                        <button className="ml-1" onClick={() => removeFilter(key)}>
                            X
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
