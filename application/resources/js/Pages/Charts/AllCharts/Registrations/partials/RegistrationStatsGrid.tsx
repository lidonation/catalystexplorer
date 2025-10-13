import Paragraph from '@/Components/atoms/Paragraph';
import { shortNumber } from '@/utils/shortNumber';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useMemo } from 'react';

const NUMBER_FORMATTER = new Intl.NumberFormat();
const formatCount = (value: number) => NUMBER_FORMATTER.format(value ?? 0);
const formatAda = (value: number) => `₳${shortNumber(value ?? 0, 2)}`;

export type RegistrationTotals = {
    total_registered_ada_power: number;
    ada_not_voted: number;
    wallets_not_voted: number;
    total_registrations: number;
    delegated_ada_power: number;
    delegated_wallets: number;
};

type RegistrationStatsGridProps = {
    totals: RegistrationTotals;
    statsConfig?: StatConfig[];
};

type StatFormat = 'ada' | 'count' | 'number';

type StatConfig = {
    key: string;
    title: string;
    value: number | null;
    format?: StatFormat;
    valueFormatter?: (value: number | null) => string;
};

const DECIMAL_FORMATTER = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const RegistrationStatsGrid = ({ totals, statsConfig = [] }: RegistrationStatsGridProps) => {
    const { t } = useLaravelReactI18n();
    const stats = useMemo<StatConfig[]>(() => {
        if (statsConfig.length > 0) {
            return statsConfig.map((stat) => ({
                format: 'count',
                ...stat,
            }));
        }

        return [
            {
                key: 'total_registered_ada_power',
                title: t('charts.registrations.stats.totalRegisteredAdaPower'),
                value: totals.total_registered_ada_power,
                format: 'ada',
            },
            {
                key: 'ada_not_voted',
                title: t('charts.registrations.stats.adaNotVoted'),
                value: totals.ada_not_voted,
                format: 'ada',
            },
            {
                key: 'wallets_not_voted',
                title: t('charts.registrations.stats.walletsNotVoted'),
                value: totals.wallets_not_voted,
                format: 'count',
            },
            {
                key: 'delegated_ada_power',
                title: t('charts.registrations.stats.delegatedAdaPower'),
                value: totals.delegated_ada_power,
                format: 'ada',
            },
            {
                key: 'delegated_wallets',
                title: t('charts.registrations.stats.delegatedWallets'),
                value: totals.delegated_wallets,
                format: 'count',
            },
            {
                key: 'total_registrations',
                title: t('charts.registrations.stats.totalRegistrations'),
                value: totals.total_registrations,
                format: 'count',
            },
        ];
    }, [statsConfig, t, totals]);

    return (
        <div className="flex h-full min-h-[360px] flex-col">
            <div className="flex-1 min-h-0">
                <div className="grid h-full min-h-0 auto-rows-[minmax(0,1fr)] gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {stats.map((stat) => (
                        <StatCard
                            key={stat.key}
                            title={stat.title}
                            value={stat.value}
                            format={stat.format}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

type StatCardProps = {
    title: string;
    value: number | null;
    format?: StatFormat;
    valueFormatter?: (value: number | null) => string;
};

const StatCard = ({ title, value, format = 'count', valueFormatter }: StatCardProps) => {
    const displayValue = (() => {
        if (typeof valueFormatter === 'function') {
            return valueFormatter(value);
        }

        if (value === null || value === undefined) {
            return '—';
        }

        if (format === 'ada') {
            return formatAda(value);
        }

        if (format === 'number') {
            return DECIMAL_FORMATTER.format(value);
        }

        return formatCount(value);
    })();

    return (
        <div className="flex min-h-full flex-col justify-between rounded-lg bg-background p-5 shadow-lg">
            <Paragraph className="text-xl text-content font-semibold">{title}</Paragraph>
            <p className="mt-4 text-3xl font-semibold text-content">{displayValue}</p>
        </div>
    );
};

export default RegistrationStatsGrid;
