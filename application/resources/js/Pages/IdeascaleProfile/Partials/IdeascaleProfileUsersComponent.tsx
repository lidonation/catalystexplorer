import ToolTipHover from '@/Components/ToolTipHover';
import UserAvatar from '@/Components/UserAvatar';
import { PageProps } from '@/types';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface IdeascaleProfileUsers extends Record<string, unknown> {
    users: App.DataTransferObjects.IdeascaleProfileData[];
    onUserClick?: (user: App.DataTransferObjects.IdeascaleProfileData) => void;
    className?: string;
    toolTipProps: any;
}

export default function IdeascaleProfileUsers({
    users,
    onUserClick,
    className,
    toolTipProps,
}: PageProps<IdeascaleProfileUsers>) {
    const { t } = useTranslation();
    
    // Limit the users array to the first 5
    const visibleUsers = users?.slice(0, 5);
    const remainingCount = users?.length - visibleUsers?.length;
    
    const baseRoute = useLocalizedRoute('ideascaleProfiles.index');
    
    const handleGenerateLink = () => {
        const userQuery = users?.map((user) => user.name || '').join(',') || '';
        const finalLink = `${baseRoute}?q=${encodeURIComponent(userQuery)}`;
        
        window.location.href = finalLink;
    };
    
    const [isHovered, setIsHovered] = useState(false);
    
    const [hoveredUserIndex, setHoveredUserIndex] = useState<number | null>(null);
    
    const handleUserClick = (user: App.DataTransferObjects.IdeascaleProfileData) => {
        if (onUserClick) {
            onUserClick(user);
        }
    };
    
    return (
        <section
            className={`relative flex`}
            aria-labelledby="team-heading"
        >
            <ul className="flex cursor-pointer -space-x-2 py-1.5">
                {visibleUsers?.map((user, index) => (
                    <li 
                        key={index} 
                        onClick={() => onUserClick?.(user)}
                        onMouseEnter={() => setHoveredUserIndex(index)}
                        onMouseLeave={() => setHoveredUserIndex(null)}
                        className="relative"
                    >
                        <UserAvatar
                            size="size-8"
                            name={user?.name}
                            imageUrl={user.hero_img_url}
                        />
                        
                        {hoveredUserIndex === index && (
                            <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 transform">
                                <div className="bg-background border-2 text-content text-xs rounded py-1 px-2 whitespace-nowrap">
                                    {user.name || t('anonymous')}
                                </div>
                            </div>
                        )}
                    </li>
                ))}
                
                {remainingCount > 0 && (
                    <li className="relative">
                        <div
                            className={`${className || ''} flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-sm text-dark`}
                            onClick={handleGenerateLink}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            {`+${remainingCount}`}
                        </div>
                        
                        {isHovered && (
                            <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 transform">
                                <ToolTipHover props={toolTipProps} />
                            </div>
                        )}
                    </li>
                )}
            </ul>
        </section>
    );
}