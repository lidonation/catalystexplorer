import ToolTipHover from '@/Components/ToolTipHover';
import UserAvatar from '@/Components/UserAvatar';
import { PageProps } from '@/types';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';

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
    const { t } = useLaravelReactI18n();

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

    const [hoveredUserIndex, setHoveredUserIndex] = useState<number | null>(
        null,
    );

    const handleUserClick = (
        user: App.DataTransferObjects.IdeascaleProfileData,
    ) => {
        if (onUserClick) {
            onUserClick(user);
        }
    };

    return (
        <section
            className={`relative flex`}
            aria-labelledby="team-heading"
            data-testid="ideascale-profile-users-section"
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
                            data-testid={`ideascale-profile-user-avatar-${index}`}
                        />

                        {hoveredUserIndex === index && (
                            <div
                                className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 transform"
                                data-testid={`ideascale-profile-user-tooltip-${index}`}
                            >
                                <div className="bg-background text-content rounded border-2 px-2 py-1 text-xs whitespace-nowrap">
                                    {user.name || t('anonymous')}
                                </div>
                            </div>
                        )}
                    </li>
                ))}

                {remainingCount > 0 && (
                    <li
                        className="relative"
                        data-testid="ideascale-profile-user-generate-link"
                    >
                        <div
                            className={`${className || ''} border-background text-dark flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm`}
                            onClick={handleGenerateLink}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            data-testid="ideascale-profile-user-generate-link-button"
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
