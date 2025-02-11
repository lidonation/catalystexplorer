import { FilteredItem, useFilterContext } from '@/Context/FiltersContext';
import { ProposalParamsEnum } from '@/enums/proposal-search-params';
import { useSearchOptions } from '@/Hooks/useSearchOptions';
import { shortNumber } from '@/utils/shortNumber';
import React, { useState } from 'react';

function formatSnakeCaseToTitleCase(input: string) {
    if (!input) return;
    return input
        ?.split('_')
        .map(
            (word: string) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(' ');
}

const labels = {
    b: 'Budgets',
    f: 'Funds',
    fs: 'Funding Status',
    pl: 'Project Length',
    ps: 'Project Status',
    op: 'Opensource',
    t: 'tags',
    cam: 'campaigns',
    coh: 'cohort',
    com: 'communities',
    ip: 'Ideascale Profiles',
    g: 'groups',
    aa: 'Amount Awarded ADA',
    au: 'Amount Awarded USD',
    pr: 'Number of Proposals',
};

type LabelKeys = keyof typeof labels;

export default function ActiveFilters({
    sortOptions,
}: {
    sortOptions?: {
        label: string;
        value: string;
    }[];
}) {
    const [clearFilter, setClearFilter] = useState(true);
    const { filters } = useFilterContext();
    const statusFilters = ['coh', 'fs', 'ps', 'f'];
    const rangeFilters = ['pl', 'b', 'aa', 'au', 'pr'];
    const sortFilters = ['st'];
    const idFilters = ['t', 'cam', 'com', 'ip', 'g'];
    const booleanFilters = ['op'];

    return (
        <div className="flex w-full flex-wrap gap-3 text-sm transition-all duration-300">
            {filters.map((filter) => {
                if (!filter.label) {
                    return;
                }
                if (
                    statusFilters.includes(filter.param) &&
                    filter.value.length
                ) {
                    return <StatusFilters key={filter.param} filter={filter} />;
                }

                if (booleanFilters.includes(filter.param)) {
                    return (
                        <BooleanFilters key={filter.param} filter={filter} />
                    );
                }

                if (
                    rangeFilters.includes(filter.param) &&
                    filter.value.length
                ) {
                    return <RangeFilters key={filter.param} filter={filter} />;
                }

                if (sortFilters.includes(filter.param)) {
                    return (
                        <SortFilters
                            key={filter.param}
                            sortOptions={sortOptions}
                            filter={filter}
                        />
                    );
                }

                if (idFilters.includes(filter.param) && filter.value.length) {
                    return <IDFilters key={filter.param} filter={filter} />;
                }
            })}
        </div>
    );
}

const StatusFilters = ({ filter }: { filter: FilteredItem }) => {
    const { setFilters } = useFilterContext();
    const removeFilter = (value?: string) => {
        const newVal = filter.value.filter(
            (val: string | undefined) => val != value,
        );
        setFilters({
            param: filter.param,
            value: newVal,
            label: filter.label,
        });
    };

    return (
        <div
            className="bg-background mr-1 flex items-center rounded-lg border px-1 py-1"
            key={filter.label}
        >
            <div className="mr-1 font-bold">{filter.label}:</div>
            <div className="mr-1 flex items-center gap-2">
                {' '}
                {filter.value.map((value: string) => (
                    <div key={value} className="flex items-center">
                        {' '}
                        <span>{formatSnakeCaseToTitleCase(value)}</span>
                        <button
                            className="ml-2"
                            onClick={() => removeFilter(value)}
                        >
                            X{' '}
                        </button>{' '}
                    </div>
                ))}
            </div>
        </div>
    );
};

const RangeFilters = ({ filter }: { filter: FilteredItem }) => {
    const { setFilters, getFilter } = useFilterContext();

    const removeFilter = () => {
        if (filter.param == ProposalParamsEnum.PROJECT_LENGTH) {
            setFilters({
                param: filter.param,
                value: [],
                label: filter.label,
            });
        } else if (filter.param == ProposalParamsEnum.BUDGETS) {
            setFilters({
                param: filter.param,
                value: [],
                label: filter.label,
            });
        } else if (filter.param == ProposalParamsEnum.AWARDED_ADA) {
            setFilters({
                param: filter.param,
                value: [],
                label: filter.label,
            });
        } else if (filter.param == ProposalParamsEnum.AWARDED_USD) {
            setFilters({
                param: filter.param,
                value: [],
                label: filter.label,
            });
        }else if (filter.param == ProposalParamsEnum.PROPOSALS) {
            setFilters({
                param: filter.param,
                value: [],
                label: filter.label,
            });
        }
    };

    return (
        <div
            className="bg-background mr-1 flex items-center rounded-lg border px-1 py-1"
            key={filter.label}
        >
            <div className="mr-1">{filter.label}</div>
            <div>{`${filter.value[0]} to ${shortNumber(filter.value[1])} `}</div>
            <button className="ml-2" onClick={() => removeFilter()}>
                X{' '}
            </button>
        </div>
    );
};

const BooleanFilters = ({ filter }: { filter: FilteredItem }) => {
    const { setFilters } = useFilterContext();
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
        >
            <div className="mr-1">{filter.label}</div>
            <button className="ml-2" onClick={() => removeFilter()}>
                X{' '}
            </button>
        </div>
    );
};

const SortFilters = ({
    filter,
    sortOptions,
}: {
    filter: FilteredItem;
    sortOptions?: {
        label: string;
        value: string;
    }[];
}) => {
    const { setFilters } = useFilterContext();

    const sort = sortOptions?.find((sort) => sort.value == filter.value);

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
        >
            <div className="mr-1">{sort?.label}</div>
            <button className="ml-2" onClick={() => removeFilter()}>
                X{' '}
            </button>
        </div>
    );
};

const IDFilters = React.memo(({ filter }: { filter: FilteredItem }) => {
    let domain = labels?.[filter.param as LabelKeys];

    if (filter.param === 'ip') {
        domain = 'ideascale-profiles';
    }

    const { setIDs, options } = useSearchOptions<any>(domain);

    React.useEffect(() => {
        setIDs(filter.value);
    }, [setIDs, filter.value]);

    const { setFilters } = useFilterContext();

    const removeFilter = (value?: string) => {
        const newVal = filter.value.filter(
            (val: string | undefined) => val != value,
        );
        setFilters({
            param: filter.param,
            value: newVal,
            label: filter.label,
        });
    };

    return (
        <div
            className="bg-background mr-1 flex items-center rounded-lg border px-1 py-1"
            key={filter.label}
        >
            <div className="mr-1 font-bold">{filter.label}:</div>
            <div className="mr-1 flex items-center gap-2">
                {' '}
                {options &&
                    options.map((option) => (
                        <div key={option.label} className="flex items-center">
                            {' '}
                            <span>
                                {formatSnakeCaseToTitleCase(
                                    option?.name ??
                                        option?.title ??
                                        option?.label,
                                )}
                            </span>
                            <button
                                className="ml-2"
                                onClick={() => removeFilter(option.id)}
                            >
                                X{' '}
                            </button>{' '}
                        </div>
                    ))}
            </div>
        </div>
    );
});
