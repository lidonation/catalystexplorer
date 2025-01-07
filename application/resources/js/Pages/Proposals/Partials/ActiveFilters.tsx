import { useFilterContext } from '@/Context/FiltersContext';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProposalSearchParams } from '../../../../types/proposal-search-params';

export default function ActiveFilters() {
    const { filters, setFilters } = useFilterContext<ProposalSearchParams>();
        const [selectedFilters, setSelectedFilters] = useState<any>({});

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
    // const idFilters = ['t', 'cam', 'com', 'ip', 'g'];
    const booleanFilters = ['op'];

    // let selectedFilters: any[] = [];

    useEffect(() => {
        const updatedFilters = Object.keys(filters).reduce(
            (acc: any, key: string) => {
                if (statusFilters.includes(key)) {
                    acc[labels[key]] = filters[key].map((item: string) =>
                        formatSnakeCaseToTitleCase(item),
                    );
                } else if (rangeFilters.includes(key)) {
                    acc[labels[key]] = filters[key];
                } else if (booleanFilters.includes(key)) {
                    acc[labels[key]] = !!parseInt(filters[key]);
                }

                return acc;
            },
            {},
        );

        setSelectedFilters(updatedFilters)
    }, [filters]);

    console.log({ selectedFilters });
    

    const { t } = useTranslation();
    return (
        <div className="p-3">
            {Object.keys(selectedFilters).map((key) => (
                <div className="bg-white p-2" key={key}>
                    <div className="font-bold">{key}</div>{' '}
                    {/* Display the key with optional styling */}
                    <div>
                        
                        {Array.isArray(selectedFilters[key])
                            ? selectedFilters[key].join(', ')
                            : selectedFilters[key]}
                    </div>{' '}
                    {/* Display the value */}
                </div>
            ))}
        </div>
    );
}
