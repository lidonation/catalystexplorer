import React from 'react';
import { useTranslation } from 'react-i18next';
import { Segments } from '../../types/segments';
import ColorDot from "@/Components/atoms/ColorDot";

interface SegmentedBarToolTipHoverProps {
    segments: Segments[];
}

const SegmentedBarToolTipHover: React.FC<SegmentedBarToolTipHoverProps> = ({
    segments,
}) => {
    return (
        <div className="relative flex justify-center">
            <div className="bg-tooltip w-60 rounded-2xl p-4 text-white shadow-lg">
                <div className="bg-tooltip absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 transform"></div>
                {/* First Section */}
                <div className="border-border-secondary mb-2 border-b pb-2">
                    {segments.map((segment, index) => (
                        <div key={index} className="flex items-center">
                            <ColorDot color={segment.color} />

                            <div className="text-3">{segment.label}:</div>

                            <div className="text-3 ml-1 font-bold">
                                {segment.value}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SegmentedBarToolTipHover;
