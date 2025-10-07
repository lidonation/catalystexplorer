import AllChartsLayout from '../AllChartsLayout';
import ComingSoonMessage from '../partials/ComingSoonMessage';
import type { SearchParams } from '@/types/search-params';
import FundData = App.DataTransferObjects.FundData;
import { useLaravelReactI18n } from 'laravel-react-i18n';

type ConfirmedVotersProps = {
    fund: FundData;
    funds?: Array<{ id: string | number; title: string; amount?: number }>;
    filters?: SearchParams;
};

const ConfirmedVoters: React.FC<ConfirmedVotersProps> = ({ fund, funds = [], filters }) => {
    const { t } = useLaravelReactI18n();
    return (
        <AllChartsLayout fund={fund} funds={funds} filters={filters}>
            <ComingSoonMessage context={t('charts.tabs.confirmedVoters')} />
        </AllChartsLayout>
    );
};

export default ConfirmedVoters;
