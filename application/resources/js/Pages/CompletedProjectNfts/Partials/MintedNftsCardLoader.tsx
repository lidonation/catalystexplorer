import React from 'react';

const MintedNftsCardLoader: React.FC = () => {
    return (
        <div className="bg-background-light relative h-[355px] w-full max-w-[325px] animate-pulse overflow-hidden rounded-xl shadow-md">
            <div className="bg-background-lighter h-full w-full"></div>

            <div className="bg-background absolute right-0 bottom-0 left-0 z-20 m-4 rounded-[20px] p-4 shadow-lg">
                <div className="bg-background-lighter mb-2 h-4 w-3/4 rounded"></div>
                <div className="bg-background-lighter mb-1 h-3 w-full rounded"></div>
                <div className="bg-background-lighter mb-1 h-3 w-5/6 rounded"></div>
                <div className="bg-background-lighter mb-4 h-3 w-4/6 rounded"></div>
                <div className="bg-background-lighter h-10 w-full rounded"></div>
            </div>
        </div>
    );
};

export default MintedNftsCardLoader;
