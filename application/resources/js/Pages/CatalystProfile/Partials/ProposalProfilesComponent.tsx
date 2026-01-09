import ToolTipHover from '@/Components/ToolTipHover';
import UserAvatar from '@/Components/UserAvatar';
import { PageProps } from '@/types';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';

interface ProposalProfileUsers extends Record<string, unknown> {
    users: (App.DataTransferObjects.CatalystProfileData | any)[];
    onUserClick?: (user: App.DataTransferObjects.CatalystProfileData | any) => void;
    className?: string;
    toolTipProps: any;
}

export default function ProposalProfiles({
    users,
    onUserClick,
    className,
    toolTipProps,
}: PageProps<ProposalProfileUsers>) {
    const { t } = useLaravelReactI18n();

    // Limit the users array to the first 5
    const visibleUsers = users?.slice(0, 5);
    const remainingCount = users?.length - visibleUsers?.length;

    const baseRoute = useLocalizedRoute('catalystProfiles.index');

    const handleGenerateLink = () => {
        // Filter by profile type and create appropriate queries - handle both full namespace and basename formats
        const ideascaleUsers = users?.filter(user =>
            'profile_type' in user && (user.profile_type === 'App\\Models\\CatalystProfile' || user.profile_type === 'CatalystProfile')
        ) || [];
        const catalystUsers = users?.filter(user =>
            'profile_type' in user && (user.profile_type === 'App\\Models\\CatalystProfile' || user.profile_type === 'CatalystProfile')
        ) || [];

        // For now, redirect to catalyst.profiles search with all user names
        // This could be enhanced to handle both profile types in the future
        const userQuery = users?.map((user) => user.name || '').join(',') || '';
        const finalLink = `${baseRoute}?q=${encodeURIComponent(userQuery)}`;

        window.location.href = finalLink;
    };

    const [isHovered, setIsHovered] = useState(false);

    const [hoveredUserIndex, setHoveredUserIndex] = useState<number | null>(
        null,
    );

    const handleUserClick = (
        user: any,
    ) => {
        if (onUserClick) {
            onUserClick(user);
        }
    };

    // Helper function to determine the profile type for routing
    const getProfileRoute = (user: any) => {
        // Check if it's the new format with profile_type
        if ('profile_type' in user && user.profile_type) {
            const profileType = user.profile_type;
            if (profileType === 'App\\Models\\CatalystProfile' || profileType === 'CatalystProfile') {
                return 'catalystProfiles.show';
            } else if (profileType === 'App\\Models\\CatalystProfile' || profileType === 'CatalystProfile') {
                // Assuming there's a catalyst profiles route, otherwise fallback to ideascale
                return 'catalystProfiles.show'; // This might need adjustment based on actual routes
            }
        }
        // Default fallback (for old format or unknown type)
        return 'catalystProfiles.show';
    };

    // Helper function to determine profile type display name
    const getProfileTypeName = (user: any): string => {
        if ('profile_type' in user && user.profile_type) {
            // Handle both full namespace and basename formats
            const profileType = user.profile_type;
            if (profileType === 'App\\Models\\CatalystProfile' || profileType === 'CatalystProfile') {
                return 'Ideascale Profile';
            } else if (profileType === 'App\\Models\\CatalystProfile' || profileType === 'CatalystProfile') {
                return 'Catalyst Profile';
            }
        }
        return 'Profile'; // fallback for old format
    };

    return (
        <section
            className={`relative flex`}
            aria-labelledby="team-heading"
            data-testid="team-members-section"
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
                            name={user?.name || undefined}
                            imageUrl={user.hero_img_url || undefined}
                            data-testid={`team-member-avatar-${index}`}
                        />

                        {hoveredUserIndex === index && (
                            <div
                                className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 transform"
                                data-testid={`team-member-tooltip-${index}`}
                            >
                                <div className="bg-background text-content rounded border-2 px-2 py-1 text-xs whitespace-nowrap">
                                    <div className="font-medium">
                                        {user.name || t('anonymous')}
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                        {getProfileTypeName(user)}
                                    </div>
                                    {user.username && (
                                        <div className="text-gray-400 text-xs">
                                            @{user.username}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </li>
                ))}

                {remainingCount > 0 && (
                    <li
                        className="relative"
                        data-testid="team-members-generate-link"
                    >
                        <div
                            className={`${className || ''} border-background text-dark flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm`}
                            onClick={handleGenerateLink}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            data-testid="team-members-generate-link-button"
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
