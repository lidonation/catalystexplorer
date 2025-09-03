import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import Image from '@/Components/Image';
import DiscordIcon from '@/Components/svgs/DiscordIcon';
import LinkedInIcon from '@/Components/svgs/LinkedInIcons';
import XIcon from '@/Components/svgs/XIcon';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;

interface ContributorProfileProps {
    contributorProfiles: IdeascaleProfileData[];
    author: IdeascaleProfileData;
    isOwner: boolean;
}

const ContributorProfile = ({
    contributorProfiles,
    author,
    isOwner,
}: ContributorProfileProps) => {
    const { t } = useLaravelReactI18n();

    // If no contributors provided or empty array, use a placeholder
    if (!contributorProfiles || contributorProfiles.length === 0) {
        return (
            <div className="bg-background rounded-lg p-6">
                <div className="py-8 text-center">
                    <Title level="3" className="mb-2 font-semibold">
                        {t('unavailable')}
                    </Title>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background rounded-lg p-6">
            <div className="mb-8">
                <div className="border-dark mb-4 flex items-start justify-between border-b pb-4">
                    <div className="flex gap-4">
                        <Image
                            imageUrl={author.hero_img_url}
                            alt={author.name}
                            className="h-20 w-20 rounded-full object-cover"
                        />
                        <div>
                            <Title
                                level="2"
                                className="text-content font-semibold"
                            >
                                {author.name}
                            </Title>
                            <Paragraph className="text-dark">
                                {author.title}
                            </Paragraph>

                            {/* Social links */}
                            <div className="mt-2 flex gap-2">
                                {author.twitter && (
                                    <a
                                        href={`https://twitter.com/${author.twitter}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:opacity-80"
                                    >
                                        <XIcon />
                                    </a>
                                )}

                                {author.discord && (
                                    <a
                                        href={`https://discord.com/users/${author.discord}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:opacity-80"
                                    >
                                        <DiscordIcon />
                                    </a>
                                )}

                                {author.linkedin && (
                                    <a
                                        href={`https://linkedin.com/in/${author.linkedin}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:opacity-80"
                                    >
                                        <LinkedInIcon />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                    {isOwner && (
                        <span className="bg-success-light text-success rounded-full border-2 px-3 py-1 text-sm">
                            {t('minting')}
                        </span>
                    )}
                </div>

                <div className="text-content space-y-4">
                    <Paragraph>
                        {typeof author.bio === 'string' ? author.bio : ''}
                    </Paragraph>
                </div>
            </div>

            {contributorProfiles.length > 0 && (
                <div>
                    <Title
                        level="3"
                        className="text-content mb-4 font-semibold"
                    >
                        {t('otherContributors')}
                    </Title>
                    <div className="border-dark border-t pt-5">
                        <div className="flex flex-wrap justify-start gap-8">
                            {contributorProfiles.map((contributor, index) => {
                                // Ensure a unique key by combining id and index as fallback
                                const uniqueKey = contributor.id
                                    ? `contributor-${contributor.id}-${index}`
                                    : `contributor-index-${index}`;

                                return (
                                    <div
                                        key={uniqueKey}
                                        className="max-w-[200px] min-w-[120px] flex-1 text-center"
                                    >
                                        <div className="mb-2 flex justify-center">
                                            <Image
                                                imageUrl={
                                                    contributor.hero_img_url
                                                }
                                                alt={contributor.name}
                                                className="border-success h-20 w-20 rounded-full border-2 object-cover"
                                            />
                                        </div>
                                        <span className="block font-medium">
                                            {contributor.name}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContributorProfile;
