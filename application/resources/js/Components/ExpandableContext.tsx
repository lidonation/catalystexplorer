import React, { useState } from 'react';
import RichContent from './RichContent'; // Adjust import path as needed

interface ExpandableContentProps {
    content?: string;
}

const ExpandableContent: React.FC<ExpandableContentProps> = ({ content }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            className={`relative cursor-pointer overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? '' : 'max-h-[7.5rem] overflow-hidden'}`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <RichContent
                className="text-content text-3 pb-2"
                content={content}
            />
            {!isExpanded && (
                <div className="absolute right-0 bottom-0 left-0 h-8" />
            )}
        </div>
    );
};

export default ExpandableContent;
