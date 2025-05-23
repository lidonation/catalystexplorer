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
    'ideascale-profiles': {
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
        statsField: [],
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
    domain:string;
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

    const { selectedItemsByType, toggleSelection, statusMessages, progress } =
        useBookmarkContext();

    const selectedHashes = selectedItemsByType[domain] || [];

    useEscapeKey(() => setSearchTerm(''));

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    function formatStat(obj: any, path: string) {
        const value = path.split('.').reduce((acc, key) => acc?.[key], obj);
        if (value == null) return '—';
        if (path?.includes('amount')) {
            const isAda = path?.includes('ada');
            return currency(value, 3, isAda ? 'ADA' : undefined);
        }
        return value;
    }

    return (
        <div>
            {/* Search Bar */}
            <div className={`sticky top-0 w-full ${className}`}>
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
                    />

                    <Button
                        onClick={() => setSearchTerm('')}
                        ariaLabel={t('clear')}
                        className="hover:text-primary absolute right-0 flex h-full w-10 items-center justify-center"
                    >
                        <CloseIcon width={16} />
                    </Button>
                </label>
            </div>

            {/* Results */}
            <div className="h-120 space-y-4 overflow-y-auto py-4 lg:mt-4 lg:space-y-3 lg:py-6">
                {options?.map((result) => {
                    const hash = result.hash;
                    console.log({
                        hash,
                        selectedHashes,
                        t: formatStat(result, model.labelField),
                    });

                    const isSelected = selectedHashes.includes(hash);

                    return (
                        <Card
                            key={hash}
                            className={`w-full rounded-xl border shadow-sm transition-all ${
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
                                        <h3 className="text-lg font-bold">
                                            {formatStat(
                                                result,
                                                model.labelField,
                                            )}
                                        </h3>

                                        <div className="flex flex-wrap gap-4 pt-1">
                                            {model.statsField.map(
                                                ({ label, value }: any, index: number) => (
                                                    <div
                                                        key={value}
                                                        className="flex items-center gap-2 text-sm"
                                                    >
                                                        <span className="font-bold">
                                                            {label}:
                                                        </span>
                                                        <span
                                                            className={`font-medium ${
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
        </div>
    );
}
