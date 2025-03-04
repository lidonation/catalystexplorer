import { useState } from 'react';
import ShareIcon from '@/Components/svgs/ShareIcon';
import XIcon from '@/Components/svgs/XIcon';
import LinkedInIcon from '@/Components/svgs/LinkedInIcons';
import DiscordIcon from '@/Components/svgs/DiscordIcon';

interface ShareButtonProps {
  url: string;
  className?: string;
  modelType?: string;
  width?: number;
  height?: number;
  itemId?: string;
}


export default function ShareButton({ url, className }: ShareButtonProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const shareLinks = {
        twitter: `https://x.com/share?url=${encodeURIComponent(url)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        discord: `https://discord.com/channels/@me`, 
    };

    const platforms = [
        { platform: 'twitter', label: 'X (Twitter)', Icon: XIcon, href: shareLinks.twitter },
        { platform: 'linkedin', label: 'LinkedIn', Icon: LinkedInIcon, href: shareLinks.linkedin },
        { platform: 'discord', label: 'Discord', Icon: DiscordIcon, href: shareLinks.discord },
    ];

    return (
        <div className="relative">
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault(); 
                    setIsDropdownOpen(!isDropdownOpen);
                }}
                className={`flex items-center justify-center rounded-full hover:bg-background p-2 transition-colors ${className}`}
                aria-label="Share"
            >
                <ShareIcon />
            </a>

            {isDropdownOpen && (
                <div className="absolute mt-2 w-48 bg-background shadow-lg rounded-md">
                    {platforms.map(({ platform, label, Icon, href }) => (
                        <a
                            key={platform}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                        >
                            <Icon className="mr-2 text-black" />
                            {label}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
