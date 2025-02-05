import UserAvatar from '@/Components/UserAvatar';
import { useTranslation } from 'react-i18next';
import { PageProps } from '@/types';

interface ProposalUsers extends Record<string, unknown> {
    users: App.DataTransferObjects.IdeascaleProfileData[];
    onUserClick: (user: App.DataTransferObjects.IdeascaleProfileData) => void;
    className?: string;
}

export default function ProposalUsers({ users,onUserClick, className }: PageProps<ProposalUsers>) {
    const { t } = useTranslation();

    // Limit the users array to the first 5
    const visibleUsers = users?.slice(0, 5);
    const remainingCount = users?.length - visibleUsers?.length;

    return (
        <section
        className={`flex justify-between pt-3 items-center ${className}`}
        aria-labelledby="team-heading"
        >
            <h3 id="team-heading" className="font-medium">
            {t('teams')}
            </h3>
            <ul className="flex cursor-pointer -space-x-2">
                {visibleUsers?.map((user) => (
                    <li key={user.id} onClick={() => onUserClick(user)}>
                        <UserAvatar
                            size="size-8"
                            imageUrl={user.profile_photo_url}
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
