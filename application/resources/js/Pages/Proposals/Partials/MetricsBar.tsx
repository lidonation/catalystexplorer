import React, { useState } from 'react';
import { useUIContext } from '@/Context/SharedUIContext';

// Define the MetricsBarProps interface to define the props the MetricsBar will receive
interface MetricsBarProps {
  submitted: number;
  approved: number;
  completed: number;
  requestedUSD: number;
  requestedNative: number;
  awardedUSD: number;
  awardedNative: number;
}

// SectionOne displays the first set of data in the MetricsBar
const SectionOne: React.FC<Pick<MetricsBarProps, 'submitted' | 'approved' | 'completed'>> = ({
  submitted,
  approved,
  completed,
}) => (
  <div className="flex justify-between items-center text-sm md:text-base w-full">
    <div className="flex flex-col items-center border-r border-dark px-2 flex-grow">
      <span className="font-semibold block content-light">Submitted</span>
      <span>{submitted.toLocaleString()}</span>
    </div>
    <div className="flex flex-col items-center border-r border-dark px-2 flex-grow">
      <span className="font-semibold block text-primary">Approved</span>
      <span>{approved.toLocaleString()}</span>
    </div>
    <div className="flex flex-col items-center px-2 flex-grow">
      <span className="font-semibold block text-success">Completed</span>
      <span>{completed.toLocaleString()}</span>
    </div>
  </div>
);

// SectionTwo displays the second set of data in the MetricsBar
const SectionTwo: React.FC<Pick<
  MetricsBarProps,
  'requestedUSD' | 'requestedNative' | 'awardedUSD' | 'awardedNative'
>> = ({ requestedUSD, requestedNative, awardedUSD, awardedNative }) => (
  <div className="flex justify-between items-center text-sm md:text-base w-full">
    <div className="flex flex-col items-center border-l border-r border-dark px-2 flex-grow">
      <span className="font-semibold block text-highlight">$ Requested</span>
      <span>
        ${requestedUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
    <div className="flex flex-col items-center border-r border-dark px-2 flex-grow">
      <span className="font-semibold block text-highlight">₳ Requested</span>
      <span>
        ₳{requestedNative.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
    <div className="flex flex-col items-center border-r border-dark px-2 flex-grow">
      <span className="font-semibold block text-highlight">$ Awarded</span>
      <span>
        ${awardedUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
    <div className="flex flex-col items-center px-2 flex-grow">
      <span className="font-semibold block text-highlight">₳ Awarded</span>
      <span>
        ₳{awardedNative.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  </div>
);

// MetricsBar Component that combines SectionOne and SectionTwo
const MetricsBar: React.FC<MetricsBarProps> = (props) => {
  const { isPlayerBarExpanded } = useUIContext(); // Access the context to manage player bar state
  const [isExpanded, setIsExpanded] = useState(false); // Local state to control MetricsBar expansion

  // Function to toggle the expansion of the MetricsBar
  const toggleExpansion = () => {
    if (!isPlayerBarExpanded) {
      setIsExpanded((prev) => !prev); // Toggle the MetricsBar only if the PlayerBar is collapsed
    }
  };

  return (
    <div
      className={`sticky bottom-0 inset-x-0 mx-auto transition-all duration-300 bg-bg-dark text-white flex items-center justify-between py-2 px-4 rounded-xl shadow-lg  overflow-hidden ${
        isExpanded && !isPlayerBarExpanded ? 'w-full' : 'w-auto'
      }`}
      onClick={toggleExpansion} // Toggle expansion when clicked
    >
      <div className="flex items-center justify-between w-full">
        <SectionOne
          submitted={props.submitted}
          approved={props.approved}
          completed={props.completed}
        />
      </div>
      {isExpanded && !isPlayerBarExpanded && (
        <div className="hidden md:flex md:space-x-4 w-full mt-2">
          <div className="flex-grow">
            <SectionTwo
              requestedUSD={props.requestedUSD}
              requestedNative={props.requestedNative}
              awardedUSD={props.awardedUSD}
              awardedNative={props.awardedNative}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsBar;
