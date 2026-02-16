import Title from '@/Components/atoms/Title';
import UserAvatar from '@/Components/UserAvatar';
import { PageProps } from '@/types';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';
import ProposalProfileData = App.DataTransferObjects.ProposalProfileData;
import CatalystProfileData = App.DataTransferObjects.CatalystProfileData;

interface ProposalUsers extends Record<string, unknown> {
    team: ProposalProfileData[];
    onUserClick: (user: App.DataTransferObjects.IdeascaleProfileData | CatalystProfileData) => void;
    className?: string;
}

export default function ProposalUsers({
    team,
    onUserClick,
    className,
}: PageProps<ProposalUsers>) {
    const { t } = useLaravelReactI18n();
    const [hoveredUserIndex, setHoveredUserIndex] = useState<number | null>(null);

    // Limit the users array to the first 5
    const visibleUsers = team?.slice(0, 5);
    const remainingCount = team?.length - visibleUsers?.length;

    return (
        <section
            className={`flex items-center justify-between pt-3 w-full ${className}`}
            aria-labelledby="team-heading"
        >
            <Title level="5" id="team-heading">
                {t('teams')}
            </Title>
            <ul className="flex cursor-pointer -space-x-2 py-1.5">
                {visibleUsers?.map((profile, index) => (
                    <li
                        key={profile?.id}
                        className="relative"
                        onClick={() => onUserClick(profile.model)}
                        onMouseEnter={() => setHoveredUserIndex(index)}
                        onMouseLeave={() => setHoveredUserIndex(null)}
                    >
                        <UserAvatar
                            size="size-8"
                            name={profile?.model?.name}
                            imageUrl={profile?.model?.hero_img_url}
                        />
                        {hoveredUserIndex === index && (
                            <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 transform">
                                <div className="bg-background text-content rounded border-2 px-2 py-1 text-xs whitespace-nowrap">
                                    <div className="font-medium">
                                        {profile?.model?.name || t('anonymous')}
                                    </div>
                                </div>
                            </div>
                        )}
                    </li>
                ))}

                {remainingCount > 0 && (
                    <li>
                        <div className="bg-content-light flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-sm text-gray-600">
                            {`+${remainingCount}`}
                        </div>
                    </li>
                )}
            </ul>
        </section>
    );
}
