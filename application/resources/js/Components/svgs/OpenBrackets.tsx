import React from 'react';

interface OpenBracketsProps {
    className?: string;
    width?: number;
    height?: number;
}

const OpenBracketsIcon: React.FC<OpenBracketsProps> = ({ className = 'text-white', width = 11, height = 11}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M4 3L1.5 6L4 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M8 3L10.5 6L8 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>  
    );
};

export default OpenBracketsIcon;