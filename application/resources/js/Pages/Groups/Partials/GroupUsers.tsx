import DiscordIcon from '@/Components/svgs/DiscordIcon';
import GitHubIcon from '@/Components/svgs/GithubIcon';
import LinkedInIcon from '@/Components/svgs/LinkedInIcons';
import WebIcon from '@/Components/svgs/WebIcon';
import XIcon from '@/Components/svgs/XIcon';
import UserAvatar from '@/Components/UserAvatar';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { useTranslation } from 'react-i18next';

interface GroupUsers {
    users: App.DataTransferObjects.IdeascaleProfileData[];
    group: App.DataTransferObjects.GroupData;
    className?: string;
}

export default function GroupUsers({ group, users }: GroupUsers) {
    const { t } = useTranslation();

    const baseRoute = useLocalizedRoute('ideascaleProfiles.index');

    const handleGenerateLink = () => {
        const userQuery = users.map((user) => user.name).join(',');
        const finalLink = `${baseRoute}?q=${encodeURIComponent(userQuery)}`;

        window.location.href = finalLink;
    };

    const visibleUsers = users?.slice(0, 5);
    const remainingCount = users?.length - visibleUsers?.length;

    const socialLinks = {
        twitter: `https://x.com/${group?.twitter}`,
        github: `https://github.com/${group?.github}`,
        linkedin: `https://www.linkedin.com/in/${group?.linkedin}`,
        discord: `https://discord.com/users/${group?.discord}`,
        web: group?.website || '',
    };

    return (
        <section
            className={`border-content-light mt-2 flex items-center justify-between border-t pt-3`}
            aria-labelledby="team-heading"
        >
            <ul className="flex cursor-pointer -space-x-2">
                {visibleUsers?.map((user) => (
                    <li key={user.hash}>
                        <UserAvatar
                            size="size-8"
                            imageUrl={user.profile_photo_url}
                        />
                    </li>
                ))}

                {remainingCount > 0 && (
                    <li>
                        <div
                            onClick={handleGenerateLink}
                            className="bg-content-light flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white text-sm text-gray-600"
                        >
                            {`+${remainingCount}`}
                        </div>
                    </li>
                )}
            </ul>
            <div className="text-content flex justify-between gap-1">
                {group?.twitter && (
                    <a
                        href={socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <XIcon className="text-content" />
                    </a>
                )}

                {group?.linkedin && (
                    <a
                        href={socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <LinkedInIcon className="text-content" />
                    </a>
                )}
                {group?.discord && (
                    <a
                        href={socialLinks.discord}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <DiscordIcon className="text-content" />
                    </a>
                )}
                {group?.github && (
                    <a
                        href={socialLinks.web}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <GitHubIcon className="text-content" />
                    </a>
                )}
                {group?.website && (
                    <a
                        href={socialLinks.web}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <WebIcon className="text-content" />
                    </a>
                )}
            </div>
        </section>
    );
}
