import React, { useState } from "react";
import CampaignData = App.DataTransferObjects.CampaignData;
import CampaignTooltipHoverComponent from "./CampaignTooltipHoverComponent";

interface SegmentedBarProps {
  CampaignData?: CampaignData,
  CompletedProposalsColor: string;
  FundedProposalsColor: string;
  UnfundedProposalsColor: string;
}

const SegmentedBar: React.FC<SegmentedBarProps> = ({  CampaignData,CompletedProposalsColor, FundedProposalsColor, UnfundedProposalsColor }) => {
  const values = [
    CampaignData?.completed_proposals_count || 0, 
    CampaignData?.funded_proposals_count || 0, 
    CampaignData?.unfunded_proposals_count || 0
  ];  
  const colors = [CompletedProposalsColor, FundedProposalsColor, UnfundedProposalsColor];
  const total = values.reduce((sum, value) => sum + value, 0);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative flex items-center w-full max-w-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {values.map((value, index) => {
        let width;
        if (total === 0) {
          width = "33.33%"; // Distribute evenly if all values are zero
        } else {
          width = (value / total) * 100 + "%";
        }
        return (
          <div
            key={index}
            className={`${colors[index]} h-2 rounded-md ${index !== 0 ? "ml-1" : ""}`}
            style={{ width }}
          ></div>
        );
      })}
      {isHovered && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2">
          <CampaignTooltipHoverComponent
            completed={CampaignData?.completed_proposals_count || 0}
            funded={CampaignData?.funded_proposals_count || 0}
            unfunded={CampaignData?.unfunded_proposals_count || 0}
          />
        </div>
      )}
    </div>
  );
};

export default SegmentedBar;
