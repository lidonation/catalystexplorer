import UserAvatar from '@/Components/UserAvatar';
import { useTranslation } from 'react-i18next';
import { PageProps } from '@/types';
import XIcon from '@/Components/svgs/XIcon';
import LinkedInIcon from '@/Components/svgs/LinkedInIcons';

interface GroupUsers {
    users: App.DataTransferObjects.IdeascaleProfileData[];
    className?: string;
}

export default function GroupUsers({ users }: GroupUsers) {
    const { t } = useTranslation();

    // Limit the users array to the first 5
    const visibleUsers = users?.slice(0, 5);
    const remainingCount = users?.length - visibleUsers?.length;

    return (
        <section
        className={`flex justify-between pt-3 items-center border-t border-content-light mt-2`}
        aria-labelledby="team-heading"
        >
            {/* <p>{users?.length}</p> */}
            <ul className="flex cursor-pointer -space-x-2">
                {visibleUsers?.map((user) => (
                    <li key={user.id}>
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
            <div className='flex justify-between gap-1'>
                <XIcon/>
                <LinkedInIcon/>
            </div>
        </section>
    );
}
