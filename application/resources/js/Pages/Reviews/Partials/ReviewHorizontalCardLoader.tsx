import React from 'react';

const ReviewHorizontalCardLoader: React.FC = () => {
  return (
    <div className="py-3 bg-background rounded-xl shadow-lg flex h-auto w-[1100px] flex-col justify-center animate-pulse">
      <div className="w-full max-w-md">
        <div className="ml-4 flex items-center space-x-4">
          <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
        <div className="ml-4 mt-4 space-y-3">
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
};

export default ReviewHorizontalCardLoader;
