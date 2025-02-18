import DiscordIcon from '@/Components/svgs/DiscordIcon';
import GitHubIcon from '@/Components/svgs/GithubIcon';
import LinkedInIcon from '@/Components/svgs/LinkedInIcons';
import WebIcon from '@/Components/svgs/WebIcon';
import XIcon from '@/Components/svgs/XIcon';
import UserAvatar from '@/Components/UserAvatar';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { useTranslation } from 'react-i18next';

interface GroupSocials {
    group: App.DataTransferObjects.GroupData;
}

export default function GroupSocials({ group }: GroupSocials) {
    const { t } = useTranslation();

    const socialLinks = {
        twitter: `https://x.com/${group?.twitter}`,
        github: `https://github.com/${group?.github}`,
        linkedin: `https://www.linkedin.com/in/${group?.linkedin}`,
        discord: `https://discord.com/users/${group?.discord}`,
        web: group?.website || '',
    };

    return (
        <div
            aria-labelledby="group-socials"
        >
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
        </div>
    );
}
