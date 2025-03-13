import React from "react";
import CampaignData = App.DataTransferObjects.CampaignData;

interface CampaignProps {
    campaigns: CampaignData[],
    children?: (campaign: CampaignData) => React.ReactNode;
    className?: string
}

const CampaignList: React.FC<CampaignProps> = ({
    campaigns,
    children,
    className
}) => {
    return (
        <div className={`grid w-full grid-cols-1 gap-6 md:grid-cols-2 xl:${className}`}>
             {campaigns.map((campaign) =>
                children ? children(campaign) : null
            )}

        </div>
    )
}

export default CampaignList;
