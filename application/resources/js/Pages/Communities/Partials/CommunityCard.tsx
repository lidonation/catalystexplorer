import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import Divider from '@/Components/Divider';
import CommunitiesIcon from '@/Components/svgs/CommunitiesSvg';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Link } from '@inertiajs/react';
import Markdown from 'marked-react';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CommunityIdeascaleProfiles from './CommunityIdeascaleProfiles';
import JoinCommunityButton from './JoinCommunityButton';
import FundData = App.DataTransferObjects.FundData;
import CampaignData = App.DataTransferObjects.CampaignData;
import CommunityData = App.DataTransferObjects.CommunityData;
import Paragraph from '@/Components/atoms/Paragraph';

interface CommunityCardProps {
    community: CommunityData;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ community }) => {
    const { t } = useTranslation();

    const [userSelected, setUserSelected] =
        useState<App.DataTransferObjects.IdeascaleProfileData | null>(null);

    const handleUserClick = useCallback(
        (user: App.DataTransferObjects.IdeascaleProfileData) =>
            setUserSelected(user),
        [],
    );

    return (
        <Card className="justify-between overflow-hidden">
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
                        <Title level="4" className="font-semibold hover:text-primary">
                            {community.title}
                        </Title>
                    </Link>
                    <Paragraph className="text-content text-5">{community.content}</Paragraph>
                </div>
            </div>
            <div>
                <div className="px-8">
                    <div className="mt-4 flex flex-row justify-between">
                        <div className="text-4 text-primary-100">
                            {t('status').toUpperCase()}
                        </div>
                        <div className="bg-background-lighter inline-flex items-center justify-center rounded-md px-2 py-1">
                            {community.status
                                ? community?.status.charAt(0).toUpperCase() +
                                  community?.status.slice(1)
                                : ''}
                        </div>
                    </div>
                    <Divider dotted={true} />
                    <div className="flex flex-row justify-between">
                        <div className="text-4 text-primary-100">
                            {t('members').toUpperCase()}
                        </div>
                        <CommunityIdeascaleProfiles
                            ideascaleProfiles={community.ideascale_profiles}
                        />
                    </div>
                </div>
                <Divider />
                <div className="align-center flex justify-center py-4">
                    <JoinCommunityButton
                        ideascale_profiles={community.ideascale_profiles}
                        community={community}
                    />
                </div>
            </div>
        </Card>
    );
};

export default CommunityCard;
