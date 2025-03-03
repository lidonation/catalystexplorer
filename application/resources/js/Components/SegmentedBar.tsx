import React, { useState } from 'react';
import { Segments } from '../../types/segments';
import SegmentedBarToolTipHover from './SegmentedBarToolTipHover';

interface SegmentedProgressBarProps {
    segments: Segments[];
    tooltipSegments?: Segments[];
    children?: React.ReactNode;
}

const SegmentedBar: React.FC<SegmentedProgressBarProps> = ({ segments, tooltipSegments,children }) => {
    const total: number = segments.filter((seg) => (typeof  seg.value !== "undefined") )
        .reduce((acc, seg) => acc + seg.value, 0);
    const [isHovered, setIsHovered] = useState(false);

    const nonZeroValues = segments.filter((segments) => segments.value > 0);
    const singleNonZeroIndex = segments.findIndex((segments) => segments.value > 0);


    return (
        <div
            className="relative flex h-2 w-full gap-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {nonZeroValues.length === 1 ? (
                <div
                    className={`${segments[singleNonZeroIndex]?.color} h-2 w-full rounded-md`}
                ></div>
            ) : (
                nonZeroValues.map((segment, index) => {
                    const width =
                        total === 0
                            ? '33.33%'
                            : `${(segment.value / total) * 100}%`;
                    return (
                        <div
                            key={index}
                            className={`${segment.color} h-2 rounded-md ${index !== 0 ? 'ml-1' : ''}`}
                            style={{ width }}
                        ></div>
                    );
                })
            )}

            {isHovered && (
                <div className="absolute bottom-full left-1/2 z-100 mb-2 -translate-x-1/2 transform">
                    <SegmentedBarToolTipHover segments={tooltipSegments || []}>{children}</SegmentedBarToolTipHover>
                </div>
            )}
        </div>
    );
};

export default SegmentedBar;
