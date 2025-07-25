import UserAvatar from '@/Components/UserAvatar';
import { PageProps } from '@/types';
import {useLaravelReactI18n} from "laravel-react-i18n";

interface CommunityIdeascaleProfilesProps extends Record<string, unknown> {
    ideascaleProfiles: App.DataTransferObjects.IdeascaleProfileData[];
    total: number;
}

export default function CommunityIdeascaleProfiles({
    ideascaleProfiles,
    total,
}: PageProps<CommunityIdeascaleProfilesProps>) {
    const { t } = useLaravelReactI18n();

    const visibleUsers = ideascaleProfiles?.slice(0, 5);
    const remainingCount = ideascaleProfiles?.length - visibleUsers?.length;

    return (
        <section className={`relative flex`} aria-labelledby="team-heading">
            <ul className="flex -space-x-2 py-1.5">
                {visibleUsers?.map((user, index) => (
                    <li key={index}>
                        <UserAvatar
                            size="size-8"
                            imageUrl={user.hero_img_url}
                            name={user.name || user.username || 'Anonymous User'}
                        />
                    </li>
                ))}

                {remainingCount > 0 && (
                    <li className="relative">
                        <div
                            className={`bg-content-light flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-sm text-gray-600`}
                        >
                            {`+${remainingCount}`}
                        </div>
                    </li>
                )}
            </ul>
        </section>
    );
}
