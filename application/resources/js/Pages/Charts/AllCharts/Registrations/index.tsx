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

type RegistrationsData = {
    fundId: string;
    ranges: RegistrationRange[];
    totals: RegistrationTotals;
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

const COLOR_PALETTE = [
    '#EBFBF1',
    '#D9F0E1',
    '#B9E0C6',
    '#A9DEBA',
    '#88D1A1',
    '#D4F1FA',
    '#B1E2F0',
    '#3FACD1',
    '#2596BE',
    '#165A72',
    '#0D3848',
    '#062029',
];

const FALLBACK_TOTALS: RegistrationTotals = {
    total_registered_ada_power: 0,
    ada_not_voted: 0,
    wallets_not_voted: 0,
    total_registrations: 0,
    delegated_ada_power: 0,
    delegated_wallets: 0,
};

const formatAda = (value: number) => `₳${shortNumber(value ?? 0, 2)}`;
const formatCount = (value: number) => NUMBER_FORMATTER.format(value ?? 0);

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
    };

    const ranges = registrationData.ranges ?? [];
    const totals = registrationData.totals ?? FALLBACK_TOTALS;

    const walletPieData = useMemo(() => buildPieData(ranges, 'count'), [ranges]);
    const adaPieData = useMemo(() => buildPieData(ranges, 'total_ada'), [ranges]);

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
                        />
                    </div>
                    <div className="xl:col-span-7">
                        <RegistrationBreakdownList ranges={ranges} />
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
            color: COLOR_PALETTE[index % COLOR_PALETTE.length],
            percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
        });

        return acc;
    }, []);
}

export default Registrations;
