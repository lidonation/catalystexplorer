import AllChartsLayout from '../AllChartsLayout';
import type { SearchParams } from '@/types/search-params';
import FundData = App.DataTransferObjects.FundData;
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { shortNumber } from '@/utils/shortNumber';
import { useMemo } from 'react';
import PieChartCard, { type PieChartDatum } from './partials/PieChartCard';
import RegistrationBreakdownList, {
    type RegistrationRange,
} from './partials/RegistrationBreakdownList';
import RegistrationStatsGrid, { type RegistrationTotals } from './partials/RegistrationStatsGrid';
import { CHART_COLOR_PALETTE } from '../constants';

type RegistrationsData = {
    fundId: string;
    ranges: RegistrationRange[];
    totals: RegistrationTotals;
    snapshotDownloadId?: string | number | null;
};

type RegistrationsProps = {
    fund: FundData;
    funds?: Array<{ id: string | number; title: string; amount?: number }>;
    filters?: SearchParams;
    activeTabRoute?: string | null;
    registrations?: RegistrationsData | null;
};

const NUMBER_FORMATTER = new Intl.NumberFormat();
const PERCENT_FORMATTER = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const FALLBACK_TOTALS: RegistrationTotals = {
    total_registered_ada_power: 0,
    ada_not_voted: 0,
    wallets_not_voted: 0,
    total_registrations: 0,
    delegated_ada_power: 0,
    delegated_wallets: 0,
};

const formatAda = (value: number) => `₳${shortNumber(value ?? 0, 2)}`;


const Registrations = ({
    fund,
    funds = [],
    filters,
    activeTabRoute,
    registrations,
}: RegistrationsProps) => {
    const { t } = useLaravelReactI18n();

    const registrationData = registrations ?? {
        fundId: fund?.id ?? '',
        ranges: [],
        totals: FALLBACK_TOTALS,
        snapshotDownloadId: null,
    };

    const ranges = registrationData.ranges ?? [];
    const totals = registrationData.totals ?? FALLBACK_TOTALS;
    const snapshotDownloadId = registrationData.snapshotDownloadId ?? null;

    const walletPieData = useMemo(() => buildPieData(ranges, 'count'), [ranges]);
    const adaPieData = useMemo(() => buildPieData(ranges, 'total_ada'), [ranges]);
    const formatCount = (value: number) => `${NUMBER_FORMATTER.format(value ?? 0)} ${t('wallets')}`;

    return (
        <AllChartsLayout
            fund={fund}
            funds={funds}
            filters={filters}
            activeTabRoute={activeTabRoute}
        >
            <Head title={`${t('charts.title')} – ${t('charts.tabs.registrations')}`} />

            <div className="space-y-6">
                <section className="grid gap-6 xl:grid-cols-12">
                    <div className="xl:col-span-5">
                        <PieChartCard
                            title={t('charts.registrations.walletPie.title')}
                            subtitle={t('charts.registrations.walletPie.subtitle')}
                            emptyMessage={t('charts.registrations.noData')}
                            data={walletPieData}
                            valueFormatter={(value) => formatCount(Math.round(value))}
                            downloadSnapshotId={snapshotDownloadId}
                        />
                    </div>
                    <div className="xl:col-span-7">
                        <RegistrationBreakdownList
                            ranges={ranges}
                            title={t('charts.registrations.breakdown.title')}
                            subtitle={t('charts.registrations.breakdown.subtitle')}
                            emptyMessage={t('charts.registrations.breakdown.empty')}
                            headers={{
                                range: t('charts.registrations.breakdown.headers.range'),
                                wallets: t('charts.registrations.breakdown.headers.wallets'),
                                totalAda: t('charts.registrations.breakdown.headers.number'),
                            }}
                            toggleSortLabel={t('charts.registrations.breakdown.toggleSort')}
                            walletCountFormatter={(count) =>
                                t('charts.registrations.breakdown.walletCount', {
                                    count: formatCount(count),
                                })
                            }
                        />
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-12">
                    <div className="xl:col-span-7">
                        <RegistrationStatsGrid totals={totals} />
                    </div>
                    <div className="xl:col-span-5">
                        <PieChartCard
                            title={t('charts.registrations.adaPie.title')}
                            subtitle={t('charts.registrations.adaPie.subtitle')}
                            emptyMessage={t('charts.registrations.noData')}
                            data={adaPieData}
                            valueFormatter={(value) => formatAda(value)}
                            downloadSnapshotId={snapshotDownloadId}
                        />
                    </div>
                </section>
            </div>
        </AllChartsLayout>
    );
};

function buildPieData(
    ranges: RegistrationRange[],
    field: 'count' | 'total_ada',
): PieChartDatum[] {
    const totalValue = ranges.reduce((acc, range) => {
        const value = field === 'count' ? range.count : range.total_ada;
        return acc + (value ?? 0);
    }, 0);

    return ranges.reduce<PieChartDatum[]>((acc, range, index) => {
        const value = field === 'count' ? range.count : range.total_ada;
        if (!value) {
            return acc;
        }

        acc.push({
            id: range.label,
            label: range.label,
            value,
            color: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
            percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
        });

        return acc;
    }, []);
}

export default Registrations;
