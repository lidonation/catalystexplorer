import DiscordIcon from '@/Components/svgs/DiscordIcon';
import GitHubIcon from '@/Components/svgs/GithubIcon';
import LinkedInIcon from '@/Components/svgs/LinkedInIcons';
import LocationIcon from '@/Components/svgs/LocationIcon';
import WebIcon from '@/Components/svgs/WebIcon';
import XIcon from '@/Components/svgs/XIcon';

interface GroupSocials {
    group: App.DataTransferObjects.GroupData & { location?: string };
    iconContainerClass?: string;
    showLink?: boolean;
    showLocation?: boolean;
}

const ensureHttps = (s?: string) =>
    s
        ? s.startsWith('http://') || s.startsWith('https://')
            ? s
            : `https://${s}`
        : '';

const stripAt = (s: string) => s.replace(/^@/, '').trim();

const githubLink = (v?: string) =>
    v
        ? /github\.com/i.test(v)
            ? ensureHttps(v)
            : `https://github.com/${stripAt(v)}`
        : '';

const linkedinLink = (v?: string) =>
    v
        ? /linkedin\.com/i.test(v)
            ? ensureHttps(v)
            : `https://www.linkedin.com/in/${stripAt(v)}`
        : '';

const xLink = (v?: string) =>
    v
        ? /x\.com|twitter\.com/i.test(v)
            ? ensureHttps(v)
            : `https://x.com/${stripAt(v)}`
        : '';

const discordLink = (v?: string) =>
    v
        ? /discord\.com|discord\.gg/i.test(v)
            ? ensureHttps(v)
            : `https://discord.com/users/${stripAt(v)}`
        : '';

const webLink = (v?: string) => ensureHttps(v || '');


const getGithubUsername = (url: string) => {
    try {
        const u = new URL(ensureHttps(url));
        const parts = u.pathname.split('/').filter(Boolean);
        return parts[0] || '';
    } catch {
        return stripAt(url);
    }
};


const formatWebsiteHost = (url: string) => {
    try {
        const u = new URL(ensureHttps(url));
        let host = u.hostname.toLowerCase();
        if (!host.startsWith('www.')) host = `www.${host}`;
        return host;
    } catch {
        let host = url.replace(/^https?:\/\//i, '').split('/')[0];
        if (!host.startsWith('www.')) host = `www.${host}`;
        return host;
    }
};


const displayNameFromUrl = (url: string) => {
    try {
        const u = new URL(ensureHttps(url));
        const host = u.hostname.replace(/^www\./, '');
        const parts = u.pathname.split('/').filter(Boolean);

        if (/linkedin\.com$/i.test(host)) {
            if (parts[0] === 'in' || parts[0] === 'company') {
                return parts[1] || host;
            }
            return parts[0] || host;
        }

        if (/x\.com$|twitter\.com$/i.test(host)) {
            return `@${parts[0] || ''}`;
        }

        if (/discord\.com$/i.test(host)) {
            return parts[1] || parts[0] || host;
        }

        return host;
    } catch {
        return url;
    }
};

export default function GroupSocials({
    group,
    iconContainerClass,
    showLink = false,
    showLocation = false,
}: GroupSocials) {
    const socialLinks = {
        twitter: xLink(group?.twitter),
        github: githubLink(group?.github),
        linkedin: linkedinLink(group?.linkedin),
        discord: discordLink(group?.discord),
        web: webLink(group?.website),
    };

    return (
        <div aria-labelledby="group-socials">
            <div className={iconContainerClass || 'text-content flex gap-2'}>
                {group?.twitter && (
                    <a
                        href={socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                    >
                        <XIcon className="text-content" />
                        {showLink && <span>@{stripAt(group.twitter)}</span>}
                    </a>
                )}

                {group?.linkedin && (
                    <a
                        href={socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                    >
                        <LinkedInIcon className="text-content" />
                        {showLink && (
                            <span>
                                {displayNameFromUrl(socialLinks.linkedin)}
                            </span>
                        )}
                    </a>
                )}

                {group?.discord && (
                    <a
                        href={socialLinks.discord}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                    >
                        <DiscordIcon className="text-content" />
                        {showLink && (
                            <span>
                                {displayNameFromUrl(socialLinks.discord)}
                            </span>
                        )}
                    </a>
                )}

                {group?.github && (
                    <a
                        href={socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                    >
                        <GitHubIcon className="text-content" />
                        {showLink && (
                            <span>
                                @{getGithubUsername(socialLinks.github)}
                            </span>
                        )}
                    </a>
                )}

                {group?.website && (
                    <a
                        href={socialLinks.web}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                    >
                        <WebIcon className="text-content" />
                        {showLink && (
                            <span>{formatWebsiteHost(socialLinks.web)}</span>
                        )}
                    </a>
                )}

                {showLocation && group?.location && (
                    <div className="flex items-center gap-2">
                        <LocationIcon className="text-content" />
                        {showLink && <span>{group.location}</span>}
                    </div>
                )}
            </div>
        </div>
    );
}
