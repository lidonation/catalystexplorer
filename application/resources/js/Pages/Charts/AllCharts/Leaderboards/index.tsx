import AllChartsLayout from '../AllChartsLayout';
import ComingSoonMessage from '../partials/ComingSoonMessage';
import type { SearchParams } from '@/types/search-params';
import FundData = App.DataTransferObjects.FundData;
import { useLaravelReactI18n } from 'laravel-react-i18n';

type LeaderboardsProps = {
    fund: FundData;
    funds?: Array<{ id: string | number; title: string; amount?: number }>;
    filters?: SearchParams;
};

const Leaderboards: React.FC<LeaderboardsProps> = ({ fund, funds = [], filters }) => {
    const { t } = useLaravelReactI18n();
    return (
        <AllChartsLayout fund={fund} funds={funds} filters={filters}>
            <ComingSoonMessage context={t('charts.tabs.leaderboards')} />
        </AllChartsLayout>
    );
};

export default Leaderboards;
