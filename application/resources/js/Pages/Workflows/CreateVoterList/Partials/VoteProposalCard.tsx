import React, { useState } from 'react';

const VoteProposalCard = ({ 
  title, 
  budget, 
  budgetAmount, 
  fund, 
  fundNumber, 
  campaign, 
  campaignType, 
  isSelected = false,
  onSelect,
  onVote
}) => {
  const [selected, setSelected] = useState(isSelected);

  const handleSelect = () => {
    const newSelected = !selected;
    setSelected(newSelected);
    if (onSelect) {
      onSelect(newSelected);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm mb-4 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {/* Checkbox container */}
          <div 
            className={`w-6 h-6 rounded border flex items-center justify-center cursor-pointer ${
              selected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
            }`}
            onClick={handleSelect}
          >
            {selected && (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-white"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
        
        {/* Budget, Fund, Campaign section */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 mb-4">
          <div className="flex items-center">
            <span className="font-medium text-gray-700">Budget:</span>
            <span className="ml-1 text-green-500 font-medium">{budget} {budgetAmount}</span>
          </div>
          
          <div className="flex items-center">
            <span className="font-medium text-gray-700">Fund:</span>
            <span className="ml-1 text-blue-500">{fund} {fundNumber}</span>
          </div>
          
          <div className="flex items-center">
            <span className="font-medium text-gray-700">Campaign:</span>
            <span className="ml-1">{campaign} {campaignType}</span>
          </div>
        </div>
        
        {/* Voting buttons */}
        <div className="flex gap-4 mt-4">
          <button 
            className="flex-1 bg-green-100 text-green-700 hover:bg-green-200 py-3 rounded-md font-medium transition"
            onClick={() => onVote && onVote('yes')}
          >
            Yes
          </button>
          <button 
            className="flex-1 bg-orange-100 text-orange-500 hover:bg-orange-200 py-3 rounded-md font-medium transition"
            onClick={() => onVote && onVote('abstain')}
          >
            Abstain
          </button>
        </div>
      </div>
    </div>
  );
};


export default VoteProposalCard;