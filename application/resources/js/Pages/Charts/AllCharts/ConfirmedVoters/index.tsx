import AllChartsLayout from '../AllChartsLayout';
import type { SearchParams } from '@/types/search-params';
import FundData = App.DataTransferObjects.FundData;
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import RegistrationStatsGrid, {
    type RegistrationTotals,
} from '../Registrations/partials/RegistrationStatsGrid';
import RegistrationBreakdownList, {
    type RegistrationRange,
} from '../Registrations/partials/RegistrationBreakdownList';
import PieChartCard, {
    type PieChartDatum,
} from '../Registrations/partials/PieChartCard';
import { useMemo } from 'react';
import { shortNumber } from '@/utils/shortNumber';
import { CHART_COLOR_PALETTE } from '../constants';

type ConfirmedVotersProps = {
    fund: FundData;
    funds?: Array<{ id: string | number; title: string; amount?: number }>;
    filters?: SearchParams;
    activeTabRoute?: string | null;
    confirmedVoters?: ConfirmedVotersData | null;
};

type ConfirmedVoterStats = {
    average_votes_cast: number | null;
    mode_votes_cast: number | null;
    median_votes_cast: number | null;
    total_confirmed_voters: number;
    total_votes_cast: number;
    total_voting_power_ada: number;
};

type ConfirmedVotersData = {
    fundId: string | number;
    stats: ConfirmedVoterStats;
    ranges: RegistrationRange[];
};

const FALLBACK_TOTALS: RegistrationTotals = {
    total_registered_ada_power: 0,
    ada_not_voted: 0,
    wallets_not_voted: 0,
    total_registrations: 0,
    delegated_ada_power: 0,
    delegated_wallets: 0,
};

const FALLBACK_STATS: ConfirmedVoterStats = {
    average_votes_cast: null,
    mode_votes_cast: null,
    median_votes_cast: null,
    total_confirmed_voters: 0,
    total_votes_cast: 0,
    total_voting_power_ada: 0,
};

const NUMBER_FORMATTER = new Intl.NumberFormat();
const formatAda = (value: number) => `₳${shortNumber(value ?? 0, 2)}`;
const formatCount = (value: number) => NUMBER_FORMATTER.format(value ?? 0);

const ConfirmedVoters: React.FC<ConfirmedVotersProps> = ({
    fund,
    funds = [],
    filters,
    activeTabRoute,
    confirmedVoters,
}) => {
    const { t } = useLaravelReactI18n();

    const confirmedData = confirmedVoters ?? {
        fundId: fund?.id ?? '',
        stats: FALLBACK_STATS,
        ranges: [],
    };

    const statsConfig = useMemo(
        () => [
            {
                key: 'average_votes_cast',
                title: t('charts.confirmedVoters.stats.averageVotesCast'),
                value: confirmedData.stats.average_votes_cast,
                format: 'count' as const,
            },
            {
                key: 'mode_votes_cast',
                title: t('charts.confirmedVoters.stats.modeVotesCast'),
                value: confirmedData.stats.mode_votes_cast,
                format: 'count' as const,
            },
            {
                key: 'median_votes_cast',
                title: t('charts.confirmedVoters.stats.medianVotesCast'),
                value: confirmedData.stats.median_votes_cast,
                format: 'number' as const,
            },
            {
                key: 'total_confirmed_voters',
                title: t('charts.confirmedVoters.stats.totalConfirmedVoters'),
                value: confirmedData.stats.total_confirmed_voters,
                format: 'count' as const,
            },
            {
                key: 'total_votes_cast',
                title: t('charts.confirmedVoters.stats.totalVotesCast'),
                value: confirmedData.stats.total_votes_cast,
                format: 'count' as const,
            },
            {
                key: 'total_voting_power_ada',
                title: t('charts.confirmedVoters.stats.totalVotingPowerAda'),
                value: confirmedData.stats.total_voting_power_ada,
                format: 'ada' as const,
            },
        ],
        [confirmedData.stats, t],
    );

    const pieData = useMemo(() => buildPieData(confirmedData.ranges, 'count'), [confirmedData.ranges]);

    return (
        <AllChartsLayout
            fund={fund}
            funds={funds}
            filters={filters}
            activeTabRoute={activeTabRoute}
        >
            <Head title={`${t('charts.title')} – ${t('charts.tabs.confirmedVoters')}`} />
            <div className="space-y-6">
                <section className="grid gap-6 xl:grid-cols-12">
                    <div className="xl:col-span-7">
                        <RegistrationStatsGrid totals={FALLBACK_TOTALS} statsConfig={statsConfig} />
                    </div>
                    <div className="xl:col-span-5">
                        <PieChartCard
                            title={t('charts.confirmedVoters.pie.title')}
                            subtitle={t('charts.confirmedVoters.pie.subtitle')}
                            emptyMessage={t('charts.confirmedVoters.pie.empty')}
                            data={pieData}
                            valueFormatter={(value) => formatCount(Math.round(value))}
                        />
                    </div>
                </section>

                <section>
                    <RegistrationBreakdownList
                        ranges={confirmedData.ranges}
                        title={t('charts.confirmedVoters.breakdown.title')}
                        subtitle={t('charts.confirmedVoters.breakdown.subtitle')}
                        emptyMessage={t('charts.confirmedVoters.breakdown.empty')}
                        headers={{
                            range: t('charts.confirmedVoters.breakdown.headers.range'),
                            wallets: t('charts.confirmedVoters.breakdown.headers.wallets'),
                            totalAda: t('charts.confirmedVoters.breakdown.headers.number'),
                        }}
                        toggleSortLabel={t('charts.confirmedVoters.breakdown.toggleSort')}
                        walletCountFormatter={(count) =>
                            t('charts.confirmedVoters.breakdown.walletCount', {
                                count: formatCount(count),
                            })
                        }
                        totalAdaFormatter={(value) => formatAda(value)}
                        labelSuffix={null}
                    />
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

export default ConfirmedVoters;
