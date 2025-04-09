import React from 'react';

const MintedNftsCardLoader: React.FC = () => {
  return (
    <div className="relative w-full max-w-[325px] h-[355px] rounded-xl overflow-hidden shadow-md animate-pulse bg-gray-200">
      <div className="w-full h-full bg-gray-300"></div>

      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-[20px] p-4 m-4 shadow-lg z-20">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
        <div className="h-3 bg-gray-300 rounded w-5/6 mb-1"></div>
        <div className="h-3 bg-gray-300 rounded w-4/6 mb-4"></div>
        <div className="h-10 bg-gray-300 rounded w-full"></div>
      </div>
    </div>
  );
};

export default MintedNftsCardLoader;
