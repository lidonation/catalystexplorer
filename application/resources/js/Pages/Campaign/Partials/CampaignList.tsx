import React from "react";
import CampaignCard from "./CampaignCard";
import CampaignData = App.DataTransferObjects.CampaignData;
import FundData = App.DataTransferObjects.FundData;
import CampaignCardMini from "./CampaignCardMini";

interface CampaignProps {
    campaigns: CampaignData[]
    fund: FundData;
}

const CampaignList: React.FC<CampaignProps> = ({
    campaigns,
    fund
}) => {
    return (
        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {campaigns &&
                campaigns?.map((campaign) => (
                    <CampaignCard key={campaign?.id} fund={fund} campaign={campaign}/>
                ))}
           
        </div>
    )
}

export default CampaignList;
