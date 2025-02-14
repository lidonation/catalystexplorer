import React from 'react';
import { useTranslation } from 'react-i18next';

interface ToolTipHoverProps {
    props: any;
}

const ToolTipHover: React.FC<ToolTipHoverProps> = ({ props }) => {
    const { t } = useTranslation();

    return (
        <div className="relative flex justify-center">
            <div className="bg-tooltip w-40 rounded-md p-2 text-white shadow-lg flex justify-center" >
                <div className="bg-tooltip absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 transform"></div>
                <p>{props}</p>
            </div>
        </div>
    );
};

export default ToolTipHover;
