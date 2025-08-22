import GitHubIcon from '@/Components/svgs/GithubIcon';
import LinkedInIcon from '@/Components/svgs/LinkedInIcons';
import { Globe } from 'lucide-react';
import React from 'react';
import LocationIcon from './svgs/LocationIcon';

interface NetworkLinksProps {
    website?: string;
    github?: string;
    linkedin?: string;
    location?: string;
    formatUrl: (url: string) => string;
    variant?: 'default' | 'compact';
}

const NetworkLinks: React.FC<NetworkLinksProps> = ({
    website,
    github,
    linkedin,
    location,
    formatUrl,
    variant = 'default',
}) => {
    const itemClasses =
        variant === 'default'
            ? 'flex items-center gap-2 truncate text-base leading-6 font-medium'
            : 'flex items-center gap-2 truncate hover:text-blue-600';

    const iconClasses =
        variant === 'default'
            ? 'h-6 w-6 shrink-0 text-slate-900'
            : 'h-5 w-5 shrink-0';

    return (
        <ul className="space-y-2">
            {website && (
                <li>
                    <a
                        href={website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={itemClasses}
                    >
                        <Globe className={iconClasses} />
                        <span>{formatUrl(website)}</span>
                    </a>
                </li>
            )}
            {github && (
                <li>
                    <a
                        href={github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={itemClasses}
                    >
                        <GitHubIcon className={iconClasses} />
                        <span>{formatUrl(github)}</span>
                    </a>
                </li>
            )}
            {linkedin && (
                <li>
                    <a
                        href={linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={itemClasses}
                    >
                        <LinkedInIcon className={iconClasses} />
                        <span>{formatUrl(linkedin)}</span>
                    </a>
                </li>
            )}
            {location && (
                <li>
                    <span className={itemClasses}>
                        <LocationIcon className={iconClasses} />
                        <span>{location}</span>
                    </span>
                </li>
            )}
        </ul>
    );
};

export default NetworkLinks;
