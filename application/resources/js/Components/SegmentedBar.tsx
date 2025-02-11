import React, { useState } from 'react';
import { Segments } from '../../types/segments';
import SegmentedBarToolTipHover from './SegmentedBarToolTipHover';

interface SegmentedProgressBarProps {
    segments: Segments[];
}

const SegmentedBar: React.FC<SegmentedProgressBarProps> = ({ segments }) => {
    const total: number = segments.reduce((acc, seg) => acc + seg.value, 0);
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div
            className="relative flex h-3 w-full gap-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {segments.map((segment, index) => {
                const width = (segment.value / total) * 100;
                return (
                    <div
                        key={index}
                        className={`h-full rounded-md ${segment.color}`}
                        style={{
                            width: `${width}%`,
                            height: '100%',
                            backgroundColor: segment.color,
                        }}
                    />
                );
            })}
            {isHovered && (
                <div className="absolute bottom-full left-1/2 z-100 mb-2 -translate-x-1/2 transform">
                    <SegmentedBarToolTipHover segments={segments} />
                </div>
            )}
        </div>
    );
};

export default SegmentedBar;
