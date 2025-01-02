import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import FundData = App.DataTransferObjects.FundData;
import CampaignCard from './Partials/CampaignCard';

interface FundProps {
    funds: FundData[] & { media?: { original_url: string }[] };
}

const Index: React.FC<FundProps> = ({ funds }) => {
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
            {funds.map((fund) => (
                <CampaignCard key={fund.user_id} fund={fund as FundData & { media?: { original_url: string }[] }} />
            ))}
            </div>
        </>
    );
};

export default Index;
