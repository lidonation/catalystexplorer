import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ShareIcon from '@/Components/svgs/ShareIcon';
import XIcon from '@/Components/svgs/XIcon';
import LinkedInIcon from '@/Components/svgs/LinkedInIcons';
import DiscordIcon from '@/Components/svgs/DiscordIcon';
import DropDown from '@/Components/atoms/DropDown';
import Button from "@/Components/atoms/Button";

interface ShareButtonProps {
  modelType?: string;
  itemId?: string;
  ideascaleProfile?: App.DataTransferObjects.IdeascaleProfileData;
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = (props) => {
  const {
    ideascaleProfile,
    className = ''
  } = props;

  const { t } = useTranslation();
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
        : 'Check out this profile'
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
        : null
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
      Icon: XIcon
    },
    {
      platform: 'linkedin',
      label: 'LinkedIn',
      url: sharingUrls.linkedin || '',
      Icon: LinkedInIcon
    },
    {
      platform: 'discord',
      label: 'Discord',
      url: sharingUrls.discord || '',
      Icon: DiscordIcon
    }
  ].filter(platform => platform.url);

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
        className={`flex items-center justify-center border-gray-persist/50 rounded-md border-1 text-gray-persist py-1.5 px-1.5 ${className}`}
        aria-label={t('share.open_share_options', 'Share')}
      >
        <ShareIcon width={20} height={20} />
      </a>

      <DropDown
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        mode="dropdown"
        triggerRef={triggerRef}
        className="w-48 bg-white border rounded-lg shadow-lg"
      >
        <>
          <ul className="py-1">
            {availablePlatforms.map(({ platform, label, url, Icon }) => (
              <li key={platform}>
                <a
                  href={url}
                  onClick={(e) => {
                    e.preventDefault();
                    shareOnPlatform(platform as 'twitter' | 'linkedin' | 'discord');
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center text-left px-4 py-2 hover:bg-background-100 transition-colors"
                >
                  <Icon
                    className="mr-2 text-content"

                  />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </>
      </DropDown>
    </>
  );
};

export default ShareButton;
