import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';
import FundData = App.DataTransferObjects.FundData;
import CampaignData = App.DataTransferObjects.CampaignData;

interface CampaignLayoutProps {
    children: ReactNode;
    campaign: CampaignData;
    fund: FundData;
}

const CampaignLayout = ({
    children,
    campaign,
    fund,
}: CampaignLayoutProps) => {
    return (
        <div className="flex w-full flex-col pb-4">
            <Head title={`${campaign?.title} - ${fund?.title}`} />
            {children}
        </div>
    );
};

export default CampaignLayout;
