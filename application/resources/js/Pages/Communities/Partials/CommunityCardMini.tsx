import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import Value from '@/Components/atoms/Value';
import Card from '@/Components/Card';
import Divider from '@/Components/Divider';
import RichContent from '@/Components/RichContent';
import CommunitiesIcon from '@/Components/svgs/CommunitiesSvg';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Link, router, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CommunityData = App.DataTransferObjects.CommunityData;
import ValueLabel from '@/Components/atoms/ValueLabel';
import Paragraph from '@/Components/atoms/Paragraph';
import { truncateEnd } from '@/utils/truncateEnd';
import Button from '@/Components/atoms/Button';

interface CommunityCardMiniProps {
    community: CommunityData & { is_member?: boolean };
    embedded?: boolean;
    isMember?: boolean;
}

const CommunityCardMini: React.FC<CommunityCardMiniProps> = ({
    community,
    embedded = true,
    isMember,
}) => {
    console.log('Community Data:', community);
    const { t } = useTranslation();
    const { props } = usePage<{ isMember?: boolean }>();
    
    const initialMemberStatus = isMember !== undefined 
        ? isMember 
        : (community.is_member !== undefined 
            ? community.is_member 
            : (props.isMember || false));
    
    const [joined, setJoined] = useState(initialMemberStatus);
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        if (isMember !== undefined) {
            setJoined(isMember);
        } else if (community.is_member !== undefined) {
            setJoined(community.is_member);
        } else if (props.isMember !== undefined) {
            setJoined(props.isMember);
        }
    }, [isMember, community.is_member, props.isMember]);
    
    const joinUrl = useLocalizedRoute('communities.join', {
        community: community.slug,
    });

    const handleJoinCommunity = async () => {
        if (joined || isLoading) return;
        
        setIsLoading(true);
        
        try {
            await router.post(joinUrl, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    setJoined(true);
                    setIsLoading(false);
                },
                onError: () => {
                    setIsLoading(false);
                }
            });
        } catch (error) {
            setIsLoading(false);
            console.error('Error joining community:', error);
        }
    };

    return (
        <Card className="border-border-dark-on-dark flex-1 justify-between overflow-hidden border">
            <div className="self-stretch inline-flex justify-between items-center">
                <div className="flex justify-start items-center gap-2">
                    <CommunitiesIcon className="text-dark h-4 w-3.5" />
                    <div className="flex gap-2">
                        <ValueLabel className="text-sm text-content">Members: </ValueLabel>
                        <Value className="text-content font-semibold text-sm">{community.users_count}</Value>
                    </div>
                </div>
                <div className="flex justify-center items-center gap-2 flex-wrap content-center">
                    <div className="px-2 py-2 bg-background-darker rounded flex justify-center items-center">
                        <Paragraph className="justify-start text-gray-persist text-sm">Published</Paragraph>
                    </div>
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
                            {truncateEnd(community.title, 20)}
                        </Title>
                    </Link>
                    <RichContent
                        className="text-content text-4 pb-2"
                        content={truncateEnd(community.content, 50)}
                    />
                </div>
            </div>
            {embedded && (
                <div>
                    <Divider />

                    <div className="align-center flex justify-center py-4">
                        {joined ? (
                            <div className="px-4 py-2 bg-background-darker text-gray-persist border border-dark rounded-xl font-medium cursor-default">
                                {t('Joined')}
                            </div>
                        ) : (
                            <Button
                                onClick={handleJoinCommunity}
                                disabled={isLoading}
                                className={`px-4 py-2 gap-2 flex rounded-xl font-medium transition-colors ${
                                    isLoading
                                        ? 'bg-gray-persist text-content cursor-not-allowed'
                                        : 'bg-primary hover:bg-primary-dark text-light-persist cursor-pointer'
                                }`}
                            >
                                <CommunitiesIcon className="pt-1 text-light-persist h-4 w-3.5" />
                                {isLoading ? t('Joining...') : t('Join')}
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
};

export default CommunityCardMini;