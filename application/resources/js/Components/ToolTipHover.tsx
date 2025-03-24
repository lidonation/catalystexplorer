import React from 'react';
import { useTranslation } from 'react-i18next';
import Paragraph from '@/Components/atoms/Paragraph';

interface ToolTipHoverProps {
    props: any;
    className?: string;
}

const ToolTipHover: React.FC<ToolTipHoverProps> = ({ props, className = '' }) => {
    const { t } = useTranslation();

    return (
        <div className="relative flex justify-center">
            <div className={`bg-tooltip rounded-md p-2 text-light-persist shadow-lg flex justify-center ${className}`}>
                <div className="bg-tooltip absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 transform"></div>
                <Paragraph size="sm" className="text-light-persist whitespace-nowrap">
                    {props}
                </Paragraph>
            </div>
        </div>
    );
};

export default ToolTipHover;