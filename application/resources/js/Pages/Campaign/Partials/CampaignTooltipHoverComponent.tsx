import React from 'react';
import { useTranslation } from 'react-i18next';

interface TooltipProps {
    completed: number;
    funded: number;
    unfunded: number;
}

const TooltipHoverComponent: React.FC<TooltipProps> = ({
    completed,
    funded,
    unfunded,
}) => {
    const { t } = useTranslation();
    const statuses = [
        { color: 'bg-success', label: t('completed'), value: completed },
        {
            color: 'bg-warning',
            label: t('proposals.options.funded'),
            value: funded,
        },
        {
            color: 'bg-primary',
            label: t('proposals.options.unfunded'),
            value: unfunded,
        },
    ];

    return (
        <div className="relative flex justify-center">
            <div className="bg-tooltip w-60 rounded-2xl p-4 text-white shadow-lg">
                <div className="bg-tooltip absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 transform"></div>
                {/* First Section */}
                <div className="border-border-secondary mb-2 border-b pb-2">
                    {statuses.map(({ color, label, value }, index) => (
                        <div key={index} className="flex items-center">
                            <div
                                className={`mr-2 h-2 w-2 rounded-full ${color}`}
                            ></div>
                            <p className="text-3">{label}:</p>
                            <p className="text-3 ml-1 font-bold">{value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TooltipHoverComponent;
