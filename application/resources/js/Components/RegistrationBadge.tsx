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
        <span className={`inline-block px-2 py-1 lg:px-3 lg:py-1.5 bg-sky-50 rounded text-cyan-600 text-xs lg:text-sm font-medium border border-sky-200 ${className}`}>
            Registration
        </span>
    );
};

export default RegistrationBadge;
