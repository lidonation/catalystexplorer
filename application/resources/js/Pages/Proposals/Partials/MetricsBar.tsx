import React, { useState } from 'react';

interface MetricsBarProps {
  submitted: number;
  approved: number;
  completed: number;
  requestedUSD: number;
  requestedNative: number;
  awardedUSD: number;
  awardedNative: number;
}


const SectionOne: React.FC<Pick<MetricsBarProps, 'submitted' | 'approved' | 'completed'>> = ({
  submitted,
  approved,
  completed,
}) => (
  <div className="flex justify-between items-center text-sm md:text-base w-full">
    <div className="flex flex-col items-center border-r border-border px-2 flex-grow">
      <span className="font-semibold block content-light">Submitted</span>
      <span>{submitted.toLocaleString()}</span>
    </div>
    <div className="flex flex-col items-center border-r border-border px-2 flex-grow">
      <span className="font-semibold block text-primary">Approved</span>
      <span>{approved.toLocaleString()}</span>
    </div>
    <div className="flex flex-col items-center px-2 flex-grow">
      <span className="font-semibold block text-success" >Completed</span>
      <span>{completed.toLocaleString()}</span>
    </div>
  </div>
);

const SectionTwo: React.FC<Pick<
  MetricsBarProps,
  'requestedUSD' | 'requestedNative' | 'awardedUSD' | 'awardedNative'
>> = ({ requestedUSD, requestedNative, awardedUSD, awardedNative }) => (
  <div className="flex justify-between items-center text-sm md:text-base w-full">
    <div className="flex flex-col items-center border-l border-r border-border px-2 flex-grow">
      <span className="font-semibold block text-highlight">$ Requested</span>
      <span>${requestedUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    </div>
    <div className="flex flex-col items-center border-r border-border px-2 flex-grow">
      <span className="font-semibold block text-highlight">₳ Requested</span>
      <span>₳{requestedNative.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    </div>
    <div className="flex flex-col items-center border-r border-border px-2 flex-grow">
      <span className="font-semibold block text-highlight">$ Awarded</span>
      <span>${awardedUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    </div>
    <div className="flex flex-col items-center px-2 flex-grow">
      <span className="font-semibold block text-highlight">₳ Awarded</span>
      <span>₳{awardedNative.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    </div>
  </div>
);

export default function MetricsBar(props: MetricsBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);


  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`sticky bottom-0 inset-x-0 mx-auto transition-all duration-300 bg-bg-dark text-white flex items-center justify-between py-2 px-4 rounded-xl shadow-lg border border-gray-700 overflow-hidden ${
        isExpanded ? 'w-full' : 'w-auto'
      }`}
      onClick={toggleExpansion}
    >
      <div className="flex items-center justify-between w-full">
        <SectionOne
          submitted={props.submitted}
          approved={props.approved}
          completed={props.completed}
        />
      </div>

      {isExpanded && (
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
}