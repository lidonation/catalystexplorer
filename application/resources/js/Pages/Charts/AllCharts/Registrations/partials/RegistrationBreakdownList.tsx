import Paragraph from '@/Components/atoms/Paragraph';
import Button from '@/Components/atoms/Button';
import { shortNumber } from '@/utils/shortNumber';
import { useMemo, useState } from 'react';

const NUMBER_FORMATTER = new Intl.NumberFormat();
const formatCount = (value: number) => NUMBER_FORMATTER.format(value ?? 0);
const formatAda = (value: number) => `₳${shortNumber(value ?? 0, 2)}`;

const defaultWalletCountFormatter = (count: number) => formatCount(count);
const defaultTotalAdaFormatter = (value: number) => formatAda(value);

export type RegistrationRange = {
    label: string;
    count: number;
    total_ada: number;
};

type RegistrationBreakdownListProps = {
    ranges: RegistrationRange[];
    title: string;
    subtitle?: string | null;
    emptyMessage: string;
    headers: {
        range: string;
        wallets: string;
        totalAda: string;
    };
    toggleSortLabel: string;
    walletCountFormatter?: (count: number) => string;
    totalAdaFormatter?: (value: number) => string;
    labelSuffix?: string | null;
};

const RegistrationBreakdownList = ({
    ranges,
    title,
    subtitle,
    emptyMessage,
    headers,
    toggleSortLabel,
    walletCountFormatter = defaultWalletCountFormatter,
    totalAdaFormatter = defaultTotalAdaFormatter,
    labelSuffix = '₳',
}: RegistrationBreakdownListProps) => {
    const [sortConfig, setSortConfig] = useState<{
        column: 'range' | 'wallets' | 'totalAda';
        direction: 'asc' | 'desc';
    }>({ column: 'range', direction: 'asc' });

    const sortedRanges = useMemo(() => {
        if (ranges.length === 0) {
            return [];
        }

        const normalizeLabelValue = (label: string) => {
            const normalized = label.trim().replace(/^>[\s]*/, '');
            const match = normalized.match(/(\d+(?:\.\d+)?)([kKmMbB]?)/);

            if (!match) {
                return Number.POSITIVE_INFINITY;
            }

            const [, value, unit] = match;
            const base = parseFloat(value);

            const multiplier = unit
                ? unit.toLowerCase() === 'k'
                    ? 1_000
                    : unit.toLowerCase() === 'm'
                        ? 1_000_000
                        : unit.toLowerCase() === 'b'
                            ? 1_000_000_000
                            : 1
                : 1;

            return base * multiplier;
        };

        return [...ranges].sort((a, b) => {
            const { column, direction } = sortConfig;

            const factor = direction === 'asc' ? 1 : -1;

            if (column === 'range') {
                const aValue = normalizeLabelValue(a.label);
                const bValue = normalizeLabelValue(b.label);

                if (aValue !== bValue) {
                    return (aValue - bValue) * factor;
                }

                return (
                    a.label.localeCompare(b.label, undefined, {
                        numeric: true,
                        sensitivity: 'base',
                    }) * factor
                );
            }

            if (column === 'wallets') {
                if (a.count !== b.count) {
                    return (a.count - b.count) * factor;
                }

                return (
                    a.label.localeCompare(b.label, undefined, {
                        numeric: true,
                        sensitivity: 'base',
                    }) * factor
                );
            }

            if (a.total_ada !== b.total_ada) {
                return (a.total_ada - b.total_ada) * factor;
            }

            return (
                a.label.localeCompare(b.label, undefined, {
                    numeric: true,
                    sensitivity: 'base',
                }) * factor
            );
        });
    }, [ranges, sortConfig]);

    const handleSort = (column: 'range' | 'wallets' | 'totalAda') => {
        setSortConfig((current) => {
            if (current.column === column) {
                return {
                    column,
                    direction: current.direction === 'asc' ? 'desc' : 'asc',
                };
            }

            return { column, direction: 'asc' };
        });
    };

    const SortIndicator = ({ column }: { column: 'range' | 'wallets' | 'totalAda' }) => {
        const isActive = sortConfig.column === column;
        const rotation = isActive && sortConfig.direction === 'asc' ? 'rotate-180' : '';

        return (
            <Paragraph
                className={`inline-flex h-5 w-5 items-center justify-center text-[15px] transition-colors ${
                    isActive ? 'text-primary' : 'text-current'
                } ${rotation}`}
                aria-hidden
            >
                ↓
            </Paragraph>
        );
    };

    return (
        <div className="flex md:h-[460px] flex-col rounded-lg bg-background shadow-lg">
            <div className="flex flex-wrap items-start justify-between gap-4 m-6">
                <div>
                    <Paragraph className="text-xl font-semibold text-content">
                        {title}
                    </Paragraph>
                    {subtitle ? (
                        <Paragraph className="text-sm text-content/70">{subtitle}</Paragraph>
                    ) : null}
                </div>
            </div>

            <div className=" flex flex-1 min-h-0 flex-col overflow-hidden  bg-background-lighter/40">
                {sortedRanges.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center px-6 py-12 text-center text-sm text-content/70">
                        {emptyMessage}
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        <table className="min-w-full table-fixed text-sm text-content">
                            <thead className="sticky top-0 z-10 bg-background-lighter border-t border-b border-light-gray-persist text-xs font-medium uppercase text-gray-persist">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <Button
                                            type="button"
                                            onClick={() => handleSort('range')}
                                            className="flex items-center gap-2 text-left transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                                            ariaLabel={toggleSortLabel}
                                        >
                                            {headers.range}
                                            <SortIndicator column="range" />
                                        </Button>
                                    </th>
                                    <th className="px-6 py-3 text-left">
                                        <Button
                                            type="button"
                                            onClick={() => handleSort('wallets')}
                                            className="flex items-center gap-2 text-left transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                                            ariaLabel={toggleSortLabel}
                                        >
                                            {headers.wallets}
                                            <SortIndicator column="wallets" />
                                        </Button>
                                    </th>
                                    <th className="px-6 py-3 text-right">
                                        <Button
                                            type="button"
                                            onClick={() => handleSort('totalAda')}
                                            className="ml-auto flex items-center justify-end gap-2 text-right transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                                            ariaLabel={toggleSortLabel}
                                        >
                                            {headers.totalAda}
                                            <SortIndicator column="totalAda" />
                                        </Button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-light-gray-persist">
                                {sortedRanges.map((range, index) => (
                                    <tr key={`${range.label}-${index}`} className="bg-background">
                                        <td className="px-6 py-4">
                                            <Paragraph className="inline-flex items-center gap-1.5 rounded-full border border-light-gray-persist/20 px-3 py-1 text-sm font-semibold text-gray-persists">
                                                {range.label}
                                                {labelSuffix ? (
                                                    <span className="text-sm font-semibold">{labelSuffix}</span>
                                                ) : null}
                                            </Paragraph>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-persist">
                                            {walletCountFormatter(range.count)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-gray-persist">
                                            {totalAdaFormatter(range.total_ada)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegistrationBreakdownList;
