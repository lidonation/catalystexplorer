import { Head } from '@inertiajs/react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import CampaignCard from './Partials/CampaignCard';
import FundData = App.DataTransferObjects.FundData;
import CampaignData = App.DataTransferObjects.CampaignData
import Title from '@/Components/atoms/Title';

interface FundProps {
    fund: FundData;
    campaigns: CampaignData[]
}

const Index: React.FC<FundProps> = ({ fund, campaigns }) => {
    const { t } = useLaravelReactI18n();

    return (
        <>
            <Head title={t('activeFund')} />

            <header>
            <div className="container">
                <Title level='1'>{t('activeFund')}</Title>
            </div>
            <div className="container">
                <p className="text-content">
                {t('appMessage')}
                </p>
            </div>
            </header>

            <div className="container mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
                <CampaignCard campaign={campaign} key={fund?.user_id} fund={fund} />
            ))}
            </div>
        </>
    );
};

export default Index;
