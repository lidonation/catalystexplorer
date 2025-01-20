import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import CampaignCard from './Partials/CampaignCard';
import FundData = App.DataTransferObjects.FundData;
import CampaignData = App.DataTransferObjects.CampaignData

interface FundProps {
    fund: FundData;
    campaigns: CampaignData[]
}

const Index: React.FC<FundProps> = ({ fund, campaigns }) => {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('activeFund')} />

            <header>
            <div className="container">
                <h1 className="title-1">{t('activeFund')}</h1>
            </div>
            <div className="container">
                <p className="text-content">
                {t('appMessage')}
                </p>
            </div>
            </header>

            <div className="container mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
                <CampaignCard campaign={campaign} key={fund?.user_id} fund={fund} />
            ))}
            </div>
        </>
    );
};

export default Index;
