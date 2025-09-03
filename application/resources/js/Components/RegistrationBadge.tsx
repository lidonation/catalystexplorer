import React from 'react';

interface RegistrationBadgeProps {
    txType?: string;
    className?: string;
}

export const RegistrationBadge: React.FC<RegistrationBadgeProps> = ({
    txType,
    className = '',
}) => {
    const voterRegistrationTypes = ['cip15', 'cip36'];
    if (!txType || !voterRegistrationTypes.includes(txType)) {
        return null;
    }

    return (
        <span
            className={`inline-block rounded border border-sky-200 bg-sky-50 px-2 py-1 text-xs font-medium text-cyan-600 lg:px-3 lg:py-1.5 lg:text-sm ${className}`}
        >
            Registration
        </span>
    );
};

export default RegistrationBadge;
