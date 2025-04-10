import React, { useState } from 'react';

interface ExpandableContentProps {
    className?: string;
    children?: React.ReactNode;
}

const ExpandableContent: React.FC<ExpandableContentProps> = ({ className, children }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            className={`relative cursor-pointer overflow-hidden transition-opacity duration-3000 ease-in-out ${isExpanded ? '' : `${className}`}`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            {children}
            {!isExpanded && (
                <div className="absolute right-0 bottom-0 left-0 h-8" />
            )}
        </div>
    );
};

export default ExpandableContent;
