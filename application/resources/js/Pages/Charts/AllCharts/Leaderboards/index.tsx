import AllChartsLayout from '../AllChartsLayout';
import ComingSoonMessage from '../partials/ComingSoonMessage';
import type { SearchParams } from '@/types/search-params';
import FundData = App.DataTransferObjects.FundData;
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';

type LeaderboardsProps = {
    fund: FundData;
    funds?: Array<{ id: string | number; title: string; amount?: number }>;
    filters?: SearchParams;
    activeTabRoute?: string | null;
};

const Leaderboards: React.FC<LeaderboardsProps> = ({
    fund,
    funds = [],
    filters,
    activeTabRoute,
}) => {
    const { t } = useLaravelReactI18n();
    return (
        <AllChartsLayout
            fund={fund}
            funds={funds}
            filters={filters}
            activeTabRoute={activeTabRoute}
        >
            <Head title={`${t('charts.title')} – ${t('charts.tabs.leaderboards')}`} />
            <ComingSoonMessage context={t('charts.tabs.leaderboards')} />
        </AllChartsLayout>
    );
};

export default Leaderboards;
