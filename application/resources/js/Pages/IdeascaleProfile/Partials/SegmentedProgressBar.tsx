import React, { useState } from "react";
import TooltipHoverComponent from "./TooltipHoverComponent";
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;

interface SegmentedBarProps {
  IdeascaleProfileData?: IdeascaleProfileData;
  CompletedProposalsColor: string;
  FundedProposalsColor: string;
  UnfundedProposalsColor: string;
}

const SegmentedBar: React.FC<SegmentedBarProps> = ({
  IdeascaleProfileData,
  CompletedProposalsColor,
  FundedProposalsColor,
  UnfundedProposalsColor,
}) => {
  const completed = IdeascaleProfileData?.completed_proposals_count || 0;
  const funded = IdeascaleProfileData?.funded_proposals_count || 0;
  const unfunded = IdeascaleProfileData?.unfunded_proposals_count || 0;
  
  let values = [completed, funded, unfunded];
  let colors = [CompletedProposalsColor, FundedProposalsColor, UnfundedProposalsColor];

  if (completed - funded === 0 && completed !== 0) {
    values = [completed];
    colors = [CompletedProposalsColor];
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  const [isHovered, setIsHovered] = useState(false);

  const nonZeroValues = values.filter((value) => value > 0);
  const singleNonZeroIndex = values.findIndex((value) => value > 0);

  return (
    <div
      className="relative flex items-center w-full max-w-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
<<<<<<< HEAD
      {nonZeroValues.length === 1 ? (
        // Render only one full-width bar if only one value is non-zero
        <div
          className={`${colors[singleNonZeroIndex]} h-2 rounded-md w-full`}
        ></div>
      ) : (
        values.map((value, index) => {
          if (value === 0) return null;
          const width = total === 0 ? "33.33%" : `${(value / total) * 100}%`;
          return (
            <div
              key={index}
              className={`${colors[index]} h-2 rounded-md ${index !== 0 ? "ml-1" : ""}`}
              style={{ width }}
            ></div>
          );
        })
      )}
=======
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
>>>>>>> dev
      {isHovered && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2">
          <TooltipHoverComponent
            completed={completed}
            funded={funded}
            unfunded={unfunded}
            proposer={IdeascaleProfileData?.own_proposals_count || 0}
            collaborator={IdeascaleProfileData?.collaborating_proposals_count || 0}
          />
        </div>
      )}
    </div>
  );
};

export default SegmentedBar;
