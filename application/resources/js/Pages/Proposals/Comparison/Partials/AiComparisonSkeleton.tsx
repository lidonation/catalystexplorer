import React from 'react';

export default function AiComparisonSkeleton() {
    return (
        <div className="w-full space-y-3 animate-pulse">
            {/* Score + Badge */}
            <div className="flex items-center justify-between">
                <div className="h-7 w-16 rounded bg-gray-light" />
                <div className="h-5 w-14 rounded-full bg-gray-light" />
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
                <div className="h-2.5 w-full rounded bg-gray-light" />
                <div className="h-2.5 w-3/4 rounded bg-gray-light" />
            </div>

            {/* Score Bars */}
            <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-1">
                        <div className="flex justify-between">
                            <div className="h-2.5 w-16 rounded bg-gray-light" />
                            <div className="h-2.5 w-8 rounded bg-gray-light" />
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-light overflow-hidden">
                            <div className="h-full rounded-full bg-primary-light" style={{ width: `${40 + i * 15}%` }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Divider */}
            <hr className="border-gray-light" />

            {/* Pros */}
            <div className="space-y-1.5">
                <div className="h-2.5 w-full rounded bg-gray-light" />
                <div className="h-2.5 w-4/5 rounded bg-gray-light" />
            </div>

            {/* Cons */}
            <div className="space-y-1.5">
                <div className="h-2.5 w-full rounded bg-gray-light" />
                <div className="h-2.5 w-3/5 rounded bg-gray-light" />
            </div>
        </div>
    );
}
