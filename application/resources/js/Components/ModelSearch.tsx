import { useBookmarkContext } from '@/Context/BookmarkContext';
import useEscapeKey from '@/Hooks/useEscapeKey';
import { useSearchOptions } from '@/Hooks/useSearchOptions';
import { currency } from '@/utils/currency';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Button from './atoms/Button';
import Checkbox from './atoms/Checkbox';
import TextInput from './atoms/TextInput';
import Card from './Card';
import CloseIcon from './svgs/CloseIcon';
import SearchLensIcon from './svgs/SearchLensIcon';

type StatField = {
    label: string;
    value: string;
};

type ModelType = {
    labelField: string;
    statsField: StatField[];
};

const modelTypes: Record<string, ModelType> = {
    proposals: {
        labelField: 'title',
        statsField: [
            { label: 'Status', value: 'funding_status' },
            { label: 'Budget', value: 'amount_requested' },
            { label: 'Fund', value: 'fund.label' },
            { label: 'Campaign', value: 'campaign.label' },
        ],
    },
    ideascaleProfiles: {
        labelField: 'name',
        statsField: [
            { label: 'Funded Proposals', value: 'funded_proposals_count' },
            {
                label: 'Completed Proposals',
                value: 'completed_proposals_count',
            },
            { label: 'Total Awarded (Ada)', value: 'amount_awarded_ada' },
            { label: 'Total Awarded (Usd)', value: 'amount_awarded_usd' },
        ],
    },
    groups: {
        labelField: 'name',
        statsField: [
            { label: 'Funded Proposals', value: 'proposals_funded' },
            { label: 'Completed Proposals', value: 'proposals_completed' },
            { label: 'Total Awarded (Ada)', value: 'amount_awarded_ada' },
            { label: 'Total Awarded (Usd)', value: 'amount_awarded_usd' },
        ],
    },
    communities: {
        labelField: 'title',
        statsField: [
            {
                label: 'Funded Proposals',
                value: 'funded_proposals_count',
            },
            {
                label: 'Completed Proposals',
                value: 'completed_proposals_count',
            },
            { label: 'IdeascaleProfiles', value: 'ideascale_profiles_count' },
        ],
    },
    reviews: {
        labelField: 'proposal.title',
        statsField: [
            { label: 'Rating', value: 'rating' },
            { label: 'Project Status', value: 'proposal.status' },
            {
                label: 'Reviewer Reputation Score',
                value: 'reviewer.avg_reputation_score',
            },
        ],
    },
};

type ModelSearchProps = {
    className?: string;
    placeholder: string;
    domain: string;
};

export default function ModelSearch({
    className,
    placeholder,
    domain,
}: ModelSearchProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();
    const { searchTerm, setSearchTerm, options } =
        useSearchOptions<any>(domain);
    const model = modelTypes[domain];
    const { selectedItemsByType, toggleSelection } = useBookmarkContext();
    const selectedHashes = selectedItemsByType[domain] || [];

    useEscapeKey(() => setSearchTerm(''));

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    function formatStat(obj: any, path: string) {
        const value = path.split('.').reduce((acc, key) => acc?.[key], obj);
        if (value == null) return '—';
        if (path?.includes('amount')) {
            return currency(value, 3, obj.currency);
        }
        return value;
    }

    // function generateLink(result: any): string {
    //     const id = result.id || result.hash || result.slug;

    //     switch (domain) {
    //         case 'proposals':
    //             return `/proposals/${result.slug || id}`;
    //         case 'ideascaleProfiles':
    //             return `/ideascale-profiles/${id}`;
    //         case 'groups':
    //             return `/groups/${result.slug || id}`;
    //         case 'communities':
    //             return `/communities/${result.slug || id}`;
    //         case 'reviews':
    //             return `/reviews/${id}`;
    //         default:
    //             return '/';
    //     }
    // }

    return (
        <div className={`relative${className}`}>
            {/* Search Bar */}
            <div className="sticky top-0 w-full">
                <label className="relative flex w-full items-center gap-2">
                    <div className="absolute left-0 flex h-full w-10 items-center justify-center">
                        <SearchLensIcon width={16} className="text-dark" />
                    </div>

                    <TextInput
                        ref={inputRef}
                        placeholder={placeholder}
                        size={placeholder.length}
                        className="bg-background text-content focus:ring-primary w-full rounded-lg pl-10 shadow-none focus:ring-2"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        data-testid="model-search-input"
                    />

                    <Button
                        onClick={() => setSearchTerm('')}
                        ariaLabel={t('clear')}
                        className="hover:text-primary absolute right-0 flex h-full w-10 items-center justify-center"
                        dataTestId="model-search-clear-button"
                    >
                        <CloseIcon width={16} />
                    </Button>
                </label>

                <p className="text-md text-dark mt-1">
                    {`Find ${domain} you're interested in and bookmark them into custom lists for easy tracking and comparison`}
                </p>
            </div>

            {/* Results (absolute and below search) */}
            {searchTerm && options.length > 0 && (
                <div className="bg-background absolute right-0 left-0 z-30 mt-2 max-h-[30rem] overflow-y-auto rounded-xl bg-white px-2 py-4 shadow-xl">
                    {options.map((result) => {
                        const hash = result.hash;
                        const isSelected = selectedHashes.includes(hash);

                        return (
                            <Card
                                key={hash}
                                className={`mb-3 w-full rounded-xl border shadow-sm transition-all ${
                                    isSelected
                                        ? 'border-primary border-2'
                                        : 'border-gray-light'
                                }`}
                            >
                                <label htmlFor={hash} className="block px-2">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id={hash}
                                            checked={isSelected}
                                            onChange={() =>
                                                toggleSelection(domain, hash)
                                            }
                                            className="bg-background text-content-accent checked:bg-primary focus:border-primary focus:ring-primary h-4 w-4 shadow-xs"
                                        />
                                        <div className="space-y-1">
                                            {/* <a href={generateLink(result)} target='_blank'> */}
                                            <h3 className="hover:cursor-pointer text-lg font-bold">
                                                {formatStat(
                                                    result,
                                                    model.labelField,
                                                )}
                                            </h3>
                                            {/* </a> */}

                                            <div className="flex flex-wrap gap-4 pt-1">
                                                {model.statsField.map(
                                                    (
                                                        { label, value }: any,
                                                        index: number,
                                                    ) => (
                                                        <div
                                                            key={value}
                                                            className="flex items-center gap-2 text-sm"
                                                        >
                                                            <span className="font-bold">
                                                                {label}:
                                                            </span>
                                                            <span
                                                                className={`${
                                                                    index === 0
                                                                        ? 'text-success'
                                                                        : index ===
                                                                            1
                                                                          ? 'text-primary'
                                                                          : index ===
                                                                              3
                                                                            ? 'text-json-key'
                                                                            : ''
                                                                }`}
                                                            >
                                                                {formatStat(
                                                                    result,
                                                                    value,
                                                                )}
                                                            </span>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
