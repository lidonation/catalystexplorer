import Paragraph from '@/Components/atoms/Paragraph';
import Button from '@/Components/atoms/Button';
import { shortNumber } from '@/utils/shortNumber';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useMemo, useState } from 'react';

const NUMBER_FORMATTER = new Intl.NumberFormat();
const formatCount = (value: number) => NUMBER_FORMATTER.format(value ?? 0);
const formatAda = (value: number) => `₳${shortNumber(value ?? 0, 2)}`;

export type RegistrationRange = {
    label: string;
    count: number;
    total_ada: number;
};

type RegistrationBreakdownListProps = {
    ranges: RegistrationRange[];
};

const RegistrationBreakdownList = ({ ranges }: RegistrationBreakdownListProps) => {
    const { t } = useLaravelReactI18n();
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const sortedRanges = useMemo(() => {
        if (ranges.length === 0) {
            return [];
        }

        return [...ranges].sort((a, b) => {
            const compare = a.label.localeCompare(b.label, undefined, {
                numeric: true,
                sensitivity: 'base',
            });

            return sortDirection === 'asc' ? compare : -compare;
        });
    }, [ranges, sortDirection]);

    const toggleSortDirection = () => {
        setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    };

    const SortIndicator = () => (
        <span className=" inline-flex h-5 w-5 items-center justify-center text-[15px]">
            {sortDirection === 'asc' ? '↑' : '↓'}
        </span>
    );

    return (
        <div className="flex h-[360px] flex-col rounded-lg bg-background shadow-lg">
            <div className="flex flex-wrap items-start justify-between gap-4 m-6">
                <div>
                    <Paragraph className="text-xl font-semibold text-content">
                        {t('charts.registrations.breakdown.title')}
                    </Paragraph>
                    <Paragraph className="text-sm text-content/70">
                        {t('charts.registrations.breakdown.subtitle')}
                    </Paragraph>
                </div>
            </div>

            <div className=" flex flex-1 min-h-0 flex-col overflow-hidden  bg-background-lighter/40">
                {sortedRanges.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center px-6 py-12 text-center text-sm text-content/70">
                        {t('charts.registrations.breakdown.empty')}
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        <table className="min-w-full table-fixed text-sm text-content">
                            <thead className="border-t border-b border-light-gray-persist text-xs font-medium uppercase text-gray-persist">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <Button
                                            type="button"
                                            onClick={toggleSortDirection}
                                            className="flex items-center gap-2 text-left transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                                            ariaLabel={t('charts.registrations.breakdown.toggleSort')}
                                        >
                                            {t('charts.registrations.breakdown.headers.range')}
                                            <SortIndicator />
                                        </Button>
                                    </th>
                                    <th className="px-6 py-3 text-left">
                                        {t('charts.registrations.breakdown.headers.wallets')}
                                    </th>
                                    <th className="px-6 py-3 text-right">
                                        {t('charts.registrations.breakdown.headers.number')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-light-gray-persist">
                                {sortedRanges.map((range, index) => (
                                    <tr key={`${range.label}-${index}`} className="bg-background">
                                        <td className="px-6 py-4 font-semibold text-gray-persist">
                                            {range.label}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-persist">
                                            {t('charts.registrations.breakdown.walletCount', {
                                                count: formatCount(range.count),
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-gray-persist">
                                            {formatAda(range.total_ada)}
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
