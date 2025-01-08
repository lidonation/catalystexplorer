import { useFilterContext } from '@/Context/FiltersContext';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProposalSearchParams } from '../../../../types/proposal-search-params';

export default function ActiveFilters() {
    const { filters, setFilters } = useFilterContext<ProposalSearchParams>();
    const [selectedFilters, setSelectedFilters] = useState<any>({});
    const [clearFilter, setClearFilter] = useState(true)

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

    function formatSnakeCaseToTitleCase(input: string) {
        return input
            ?.split('_')
            .map(
                (word: string) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
            )
            .join(' ');
    }

    const statusFilters = ['coh', 'fs', 'ps'];
    const rangeFilters = ['pl', 'b'];
    const idFilters = ['t', 'cam', 'com', 'ip', 'g'];
    const booleanFilters = ['op'];

    useEffect(() => {
        const updatedFilters = Object.keys(filters).reduce(
            (acc: any, key: string) => {
                if (statusFilters.includes(key)) {
                    acc[labels[key as keyof typeof labels]] = filters[key].map((item: string) =>
                        formatSnakeCaseToTitleCase(item),
                    );
                } else if (rangeFilters.includes(key)) {
                    acc[labels[key as keyof typeof labels]] = filters[key as keyof typeof labels];
                } else if (booleanFilters.includes(key)) {
                    acc[labels[key as keyof typeof labels]] = !!parseInt(filters[key]);
                } else if (idFilters.includes(key)) {
                    // I have tried to add the parameters for idFilters...
                    acc[labels[key as keyof typeof labels]] = filters[key]?.join(', ') ?? filters[key];
                } else {
                    acc[labels[key as keyof typeof labels]] = filters[key];
                }

                return acc;
            },
            {},
        );

        setSelectedFilters(updatedFilters);
    }, [filters]);

    const { t } = useTranslation();



    const removeFilter = (key: string, value?: string) => {
        const newFilters = { ...filters };
        if (value && Array.isArray(newFilters[key])) {
            newFilters[key] = newFilters[key].filter((item: string) => item !== value);
            if (newFilters[key].length === 0) {
                newFilters[key] = [];
            }
        } else {
            newFilters[key] = [];
        }
        setSelectedFilters(newFilters);
    };

    const handleClearFilter = () => {
        setClearFilter(!clearFilter);
    }

    return (
        <div className="pt-2 flex flex-wrap">
            {Object.keys(selectedFilters).map((key) => (
                <div
                    className="bg-background border rounded-md flex items-center px-1 py-1 mr-1 mb-1"
                    key={key}
                >
                    <div className="font-bold mr-1">{key}:</div>
                    <div className="mr-1"> {Array.isArray(selectedFilters[key]) ? selectedFilters[key].map((value: string) => clearFilter ?
                        (<div key={value} className="flex items-center"> <span>{value}</span>
                            <button className="ml-2" onClick={() => removeFilter(key, value)} >
                                X </button> </div>) : null) : selectedFilters[key]} </div>
                    {!Array.isArray(selectedFilters[key]) && (
                        <button
                            className="ml-1"
                            onClick={() => removeFilter(key)}
                        >
                            X
                        </button>
                    )}
                </div>
            ))}

        </div>
    );
}
