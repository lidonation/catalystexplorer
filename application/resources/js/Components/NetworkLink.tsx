import React from 'react';

interface NetworkLinkProps {
    icon: React.ReactNode;
    url?: string;
    formatUrl?: (url: string) => string;
    label?: string;
    className?: string;
    width?: number | string;
    height?: number | string;
}

const NetworkLink: React.FC<NetworkLinkProps> = ({
    icon,
    url,
    formatUrl,
    label,
    className,
    width = 25,
    height = 24,
}) => {
    const baseClasses = `flex items-center gap-2.5 truncate text-white`;

    const displayText = url && formatUrl ? formatUrl(url) : (label ?? '');

    const content = (
        <>
            <span style={{ width, height }}>{icon}</span>
            <span>{displayText}</span>
        </>
    );

    return (
        <li>
            {url ? (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${baseClasses} ${className ?? ''}`}
                >
                    {content}
                </a>
            ) : (
                <span className={`${baseClasses} ${className ?? ''}`}>
                    {content}
                </span>
            )}
        </li>
    );
};

export default NetworkLink;
