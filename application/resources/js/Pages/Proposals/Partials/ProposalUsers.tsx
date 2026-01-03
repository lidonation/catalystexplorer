import Title from '@/Components/atoms/Title';
import UserAvatar from '@/Components/UserAvatar';
import { PageProps } from '@/types';
import { useLaravelReactI18n } from 'laravel-react-i18n';
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

    console.log({team});

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
                {visibleUsers?.map((profile) => (
                    <li key={profile?.id} onClick={() => onUserClick(profile.model)}>
                        <UserAvatar
                            size="size-8"
                            name={profile?.model?.name}
                            imageUrl={profile?.model?.hero_img_url}
                        />
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
