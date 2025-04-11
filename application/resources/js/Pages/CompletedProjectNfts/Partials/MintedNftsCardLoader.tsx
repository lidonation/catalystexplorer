import React from 'react';

const MintedNftsCardLoader: React.FC = () => {
  return (
    <div className="relative w-full max-w-[325px] h-[355px] rounded-xl overflow-hidden shadow-md animate-pulse bg-background-light">
      <div className="w-full h-full bg-background-lighter"></div>

      <div className="absolute bottom-0 left-0 right-0 bg-background p-4 m-4 rounded-[20px] shadow-lg z-20">
        <div className="h-4 bg-background-lighter rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-background-lighter rounded w-full mb-1"></div>
        <div className="h-3 bg-background-lighter rounded w-5/6 mb-1"></div>
        <div className="h-3 bg-background-lighter rounded w-4/6 mb-4"></div>
        <div className="h-10 bg-background-lighter rounded w-full"></div>
      </div>
    </div>
  );
};

export default MintedNftsCardLoader;
