import React from 'react';

const ReviewHorizontalCardLoader: React.FC = () => {
    return (
        <div className="bg-background flex h-auto w-[1100px] animate-pulse flex-col justify-center rounded-xl py-3 shadow-lg">
            <div className="w-full max-w-md">
                <div className="ml-4 flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-gray-300"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-gray-300"></div>
                        <div className="h-4 w-1/2 rounded bg-gray-300"></div>
                    </div>
                </div>
                <div className="mt-4 ml-4 space-y-3">
                    <div className="h-4 rounded bg-gray-300"></div>
                    <div className="h-4 w-5/6 rounded bg-gray-300"></div>
                    <div className="h-4 w-2/3 rounded bg-gray-300"></div>
                </div>
            </div>
        </div>
    );
};

export default ReviewHorizontalCardLoader;
