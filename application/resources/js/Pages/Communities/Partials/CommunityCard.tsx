import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import React from 'react';
import { useTranslation } from 'react-i18next';
import CommunityData = App.DataTransferObjects.CommunityData;
import Button from '@/Components/atoms/Button';
import CommunityIcon from '@/Components/svgs/CommunityIcon';
import { cn } from '@/lib/utils';

interface CommunityCardProps {
    community: CommunityData;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ community }) => {
    const { t } = useTranslation();

    const userMember = community.user_id! % 2 > 0;

    const joinCommunity = (community: CommunityData) => {
        console.log(community);
        
    }

    return (
        community && (
            <Card>
                <div className='flex flex-col h-full'>
                    <div className="flex flex-col px-5 gap-4">
                        <div className="text-center flex flex-col items-center gap-2">
                            <div className="flex justify-center py-2 w-full">
                                <div className='bg-background-lighter size-24 rounded-full flex items-center justify-center'>
                                    <CommunityIcon className='size-12' />
                                </div>
                            </div>
                            <Title level='4' className="leading-6 font-bold">{community.title}</Title>
                            <div>{community.content}</div>
                        </div>
                        <div>
                            <div className="flex py-4">
                                <span className='text-highlight'>{t('communities.status').toLocaleUpperCase()}</span>
                                <span className='ml-auto p-2 py-1 rounded-lg bg-background-darker'>{community.status}</span>
                            </div>

                            {/* <div className="flex py-4 border-border-secondary border-t">
                                <span className='text-highlight'>{t('communities.members').toLocaleUpperCase()}</span>
                                <span className='ml-auto'>{community.status}</span>
                            </div> */}
                        </div>
                    </div>
                    <div className="flex py-3 justify-center items-center border-border-secondary border-t flex-1">
                        <Button
                            onClick={!userMember ? ()=>joinCommunity(community) :undefined}
                            className={cn('border-1 border-border-secondary px-5 py-2 flex items-center gap-1', userMember?'':'bg-primary text-light')}>
                            { !userMember && <CommunityIcon className='text-content-light' width={18} height={18}/>}
                            <span className={userMember? '':'text-content-light'}>{ !userMember ? t('communities.join') : t('communities.joined')}</span>
                        </Button>
                    </div>
                </div>
            </Card>
        )
    );
};

export default CommunityCard;
