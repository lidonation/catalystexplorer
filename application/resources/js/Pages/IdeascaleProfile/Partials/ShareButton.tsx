import DropDown from '@/Components/atoms/DropDown';
import DiscordIcon from '@/Components/svgs/DiscordIcon';
import LinkedInIcon from '@/Components/svgs/LinkedInIcons';
import ShareIcon from '@/Components/svgs/ShareIcon';
import XIcon from '@/Components/svgs/XIcon';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React, { useRef, useState } from 'react';

interface ShareButtonProps {
    modelType?: string;
    itemId?: string;
    ideascaleProfile?: App.DataTransferObjects.IdeascaleProfileData;
    className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = (props) => {
    const { ideascaleProfile, className = '' } = props;

    const { t } = useLaravelReactI18n();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const triggerRef = useRef<HTMLAnchorElement>(null);

    const getCurrentPageUrl = () => {
        return window.location.href;
    };

    const getShareUrls = () => {
        const pageUrl = encodeURIComponent(getCurrentPageUrl());
        const title = encodeURIComponent(
            ideascaleProfile?.name
                ? `Check out ${ideascaleProfile.name}'s profile`
                : 'Check out this profile',
        );

        return {
            twitter: ideascaleProfile?.twitter
                ? `https://twitter.com/${ideascaleProfile.twitter.replace('@', '')}`
                : null,
            linkedin: ideascaleProfile?.linkedin
                ? `https://www.linkedin.com/in/${ideascaleProfile.linkedin.replace('https://www.linkedin.com/in/', '').replace('/', '')}`
                : `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`,
            discord: ideascaleProfile?.discord
                ? `https://discord.com/users/${ideascaleProfile.discord}`
                : null,
        };
    };

    const shareOnPlatform = (platform: 'twitter' | 'linkedin' | 'discord') => {
        const sharingUrls = getShareUrls();
        const url = sharingUrls[platform];

        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
        setIsDropdownOpen(false);
    };

    const sharingUrls = getShareUrls();
    const availablePlatforms = [
        {
            platform: 'twitter',
            label: 'X',
            url: sharingUrls.twitter || '',
            Icon: XIcon,
        },
        {
            platform: 'linkedin',
            label: 'LinkedIn',
            url: sharingUrls.linkedin || '',
            Icon: LinkedInIcon,
        },
        {
            platform: 'discord',
            label: 'Discord',
            url: sharingUrls.discord || '',
            Icon: DiscordIcon,
        },
    ].filter((platform) => platform.url);

    if (availablePlatforms.length === 0) {
        return null;
    }

    return (
        <>
            <a
                ref={triggerRef}
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    setIsDropdownOpen(true);
                }}
                className={`border-gray-persist/50 text-gray-persist flex items-center justify-center rounded-md border-1 px-1.5 py-1.5 ${className}`}
                aria-label={t('share.open_share_options')}
            >
                <ShareIcon width={20} height={20} />
            </a>

            <DropDown
                isOpen={isDropdownOpen}
                onClose={() => setIsDropdownOpen(false)}
                mode="dropdown"
                triggerRef={triggerRef}
                className="w-48 rounded-lg border bg-white shadow-lg"
            >
                <>
                    <ul className="py-1">
                        {availablePlatforms.map(
                            ({ platform, label, url, Icon }) => (
                                <li key={platform}>
                                    <a
                                        href={url}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            shareOnPlatform(
                                                platform as
                                                    | 'twitter'
                                                    | 'linkedin'
                                                    | 'discord',
                                            );
                                        }}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:bg-background-100 flex w-full items-center px-4 py-2 text-left transition-colors"
                                    >
                                        <Icon className="text-content mr-2" />
                                        {label}
                                    </a>
                                </li>
                            ),
                        )}
                    </ul>
                </>
            </DropDown>
        </>
    );
};

export default ShareButton;
