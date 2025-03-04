import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ShareIcon from '@/Components/svgs/ShareIcon';
import XIcon from '@/Components/svgs/XIcon';
import LinkedInIcon from '@/Components/svgs/LinkedInIcons';
import DiscordIcon from '@/Components/svgs/DiscordIcon';

interface ShareButtonProps {
  modelType?: string;
  itemId?: string;
  ideascaleProfile?: App.DataTransferObjects.IdeascaleProfileData;
  className?: string;
  width?: number;
  height?: number;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  modelType = 'ideascale-profiles',
  itemId = '0',
  ideascaleProfile,
  className = ''
}) => {
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsDropdownOpen(false);
    }
  };

  React.useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  // Generate share URLs if not provided
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
        ? `https://twitter.com/intent/tweet?text=${title}&url=${pageUrl}&via=${ideascaleProfile.twitter.replace('@', '')}` 
        : `https://twitter.com/intent/tweet?text=${title}&url=${pageUrl}`,
      linkedin: ideascaleProfile?.linkedin 
        ? ideascaleProfile.linkedin 
        : `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`,
      discord: ideascaleProfile?.discord || null
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

  // Only show platforms that have a URL
  const sharingUrls = getShareUrls();
  const availablePlatforms = [
    { 
      platform: 'twitter', 
      label: 'X', 
      url: sharingUrls.twitter,
      Icon: XIcon
    },
    { 
      platform: 'linkedin', 
      label: 'LinkedIn', 
      url: sharingUrls.linkedin,
      Icon: LinkedInIcon
    },
    { 
      platform: 'discord', 
      label: 'Discord', 
      url: sharingUrls.discord,
      Icon: DiscordIcon
    }
  ].filter(platform => platform.url);

  // If no available platforms, don't render the button
  if (availablePlatforms.length === 0) {
    return null;
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`flex items-center justify-center rounded-full hover:bg-background p-2 transition-colors ${className}`}
        aria-label={t('share.open_share_options', 'Share')}
      >
        <ShareIcon />
      </button>
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-background border rounded-lg shadow-lg z-10">
          <ul className="py-1">
            {availablePlatforms.map(({ platform, label, Icon }) => (
              <li key={platform}>
                <button
                  onClick={() => shareOnPlatform(platform as 'twitter' | 'linkedin' | 'discord')}
                  className="w-full flex items-center text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  <Icon 
                    className="mr-2 text-black"
                  />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ShareButton;