import AllChartsLayout from '../AllChartsLayout';
import ComingSoonMessage from '../partials/ComingSoonMessage';
import type { SearchParams } from '@/types/search-params';
import FundData = App.DataTransferObjects.FundData;
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';

type ConfirmedVotersProps = {
    fund: FundData;
    funds?: Array<{ id: string | number; title: string; amount?: number }>;
    filters?: SearchParams;
    activeTabRoute?: string | null;
};

const ConfirmedVoters: React.FC<ConfirmedVotersProps> = ({
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
            <Head title={`${t('charts.title')} – ${t('charts.tabs.confirmedVoters')}`} />
            <ComingSoonMessage context={t('charts.tabs.confirmedVoters')} />
        </AllChartsLayout>
    );
};

export default ConfirmedVoters;
