import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import Value from '@/Components/atoms/Value';
import Card from '@/Components/Card';
import Divider from '@/Components/Divider';
import RichContent from '@/Components/RichContent';
import CommunitiesIcon from '@/Components/svgs/CommunitiesSvg';
import { ListProvider } from '@/Context/ListContext';
import BookmarkButton from '@/Pages/My/Bookmarks/Partials/BookmarkButton';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Link } from '@inertiajs/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import CommunityIdeascaleProfiles from './CommunityIdeascaleProfiles';
import CommunityData = App.DataTransferObjects.CommunityData;

interface CommunityCardProps {
    community: CommunityData;
    embedded?: boolean;
}

const CommunityCard: React.FC<CommunityCardProps> = ({
    community,
    embedded = true,
}) => {
    const { t } = useTranslation();

    return (
        <Card className="border-border-dark-on-dark flex-1 justify-between overflow-hidden border">
            <div className="ml-auto border-gray-persist/50 text-gray-persist/50 w-fit items-center rounded-md border-1 py-0">
                <ListProvider>
                    <BookmarkButton
                        modelType="communities"
                        width={16}
                        height={16}
                        itemId={community?.hash ?? '0'}
                    />
                </ListProvider>
            </div>
            <div className="flex h-auto w-full items-center justify-center overflow-hidden pt-8 pb-4">
                <div className="bg-background-darker border-background-lighter flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4">
                    <CommunitiesIcon className="text-dark h-8 w-8" />
                </div>
            </div>
            <div className="px-8">
                <div className="flex w-full flex-col items-center justify-center text-center">
                    <Link
                        href={useLocalizedRoute('communities.dashboard', {
                            slug: community.slug,
                        })}
                    >
                        <Title
                            level="4"
                            className="hover:text-primary font-semibold"
                        >
                            {community.title}
                        </Title>
                    </Link>
                    <RichContent
                        className="text-content text-4 pb-2"
                        content={community.content}
                    />
                </div>
            </div>
            {embedded && (
                <div>
                    <div className="px-8">
                        <div className="mt-4 flex flex-row items-center justify-between">
                            <div className="text-4 text-primary-100">
                                {t('communities.proposers').toUpperCase()}
                            </div>

                            <CommunityIdeascaleProfiles
                                ideascaleProfiles={community.ideascale_profiles}
                                total={community.ideascale_profiles_count}
                            />
                        </div>

                        <Divider dotted={true} />

                        <div className="flex flex-row items-center justify-between">
                            <div className="text-4 text-primary-100">
                                {t('communities.proposals').toUpperCase()}
                            </div>
                            <Value>{community.proposals_count}</Value>
                        </div>
                    </div>

                    <Divider />

                    <div className="align-center flex justify-center py-4">
                        <PrimaryLink
                            href={useLocalizedRoute('communities.dashboard', {
                                slug: community.slug,
                            })}
                        >
                            {t('explore')}
                        </PrimaryLink>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default CommunityCard;
