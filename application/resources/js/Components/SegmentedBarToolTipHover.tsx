import React from 'react';
import { useTranslation } from 'react-i18next';
import { Segments } from '../../types/segments';

interface SegmentedBarToolTipHoverProps {
    segments: Segments[];
}

const SegmentedBarToolTipHover: React.FC<SegmentedBarToolTipHoverProps> = ({
    segments,
}) => {
    const { t } = useTranslation();

    return (
        <div className="relative flex justify-center">
            <div className="bg-tooltip w-60 rounded-2xl p-4 text-white shadow-lg">
                <div className="bg-tooltip absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 transform"></div>
                {/* First Section */}
                <div className="border-border-secondary mb-2 border-b pb-2">
                    {segments.map((segment, index) => (
                        <div key={index} className="flex items-center">
                            <div
                                className={`mr-2 h-2 w-2 rounded-full ${segment.color}`}
                            ></div>
                            <p className="text-3">{segment.label}:</p>
                            <p className="text-3 ml-1 font-bold">
                                {segment.value}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SegmentedBarToolTipHover;
