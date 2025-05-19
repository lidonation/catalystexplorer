import { FilteredItem } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { useSearchOptions } from '@/Hooks/useSearchOptions';
import fromSnakeCase from '@/utils/fromSnakecase';
import React, { useEffect } from 'react';
import labels from './FiltersLabel';

type LabelKeys = keyof typeof labels;

const domainMap: Record<string, string> = {
    [ParamsEnum.IDEASCALE_PROFILES]: 'ideascale-profiles',
    [ParamsEnum.PROPOSALS]: 'proposals',
    [ParamsEnum.REVIEWER_IDS]: 'reviewers',
    [ParamsEnum.FUNDS]: 'funds',
};

const getDisplayName = (option: any): string =>
    fromSnakeCase(
        option?.name ??
            option?.title ??
            option?.label ??
            option?.catalyst_reviewer_id ??
            '',
    ) ?? '';

// todo revisit logic
const IDFilters = React.memo(
    ({
        filter,
        setFilters,
    }: {
        filter: FilteredItem;
        setFilters: (filter: FilteredItem) => void;
    }) => {
        const domain =
            domainMap[filter.param] || labels[filter.param as LabelKeys];
        const { setHashes, options } = useSearchOptions<any>(domain);

        useEffect(() => {
            setHashes(filter.value);
        }, [setHashes, filter.value]);

        //if has comparison table fund filter
        const hasFund = filter.value.some((value: string) =>
            value.includes('Fund'),
        );

        const selectedOptions = options.filter((option) => {
            // for comparison table
            if (hasFund) {
                return filter.value.includes(option.label);
            }

            return filter.value.includes(option.hash);
        });

        const removeFilter = (value?: string) => {
            // for comparison table fund filter
            if (hasFund) {
                const fundLabel = selectedOptions.find(
                    (fund) => fund.hash == value,
                ).title;

                setFilters({
                    label:filter.label,
                    param:filter.param,
                    value: filter.value.filter(
                        (val: string | undefined) => val !== fundLabel,
                    ),
                });
                return;
            }

            setFilters({
                ...filter,
                value: filter.value.filter(
                    (val: string | undefined) => val !== value,
                ),
            });
        };


        return (
            <div
                className="bg-background mr-1 flex items-center rounded-lg border px-1 py-1"
                key={`${filter.label}-${filter.param}`}
            >
                <div className="mr-1 font-bold">{filter.label}:</div>
                <div className="mr-1 flex items-center gap-2">
                    {selectedOptions.map((option) => (
                        <div key={option.hash} className="flex items-center">
                            <span>{getDisplayName(option)}</span>
                            <button
                                className="ml-2"
                                onClick={() => removeFilter(option.hash)}
                            >
                                X
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    },
);

export default IDFilters;
