import UserAvatar from '@/Components/UserAvatar';
import {ListProvider} from '@/Context/ListContext';
import BookmarkButton from '@/Pages/My/Bookmarks/Partials/BookmarkButton';
import {useTranslation} from 'react-i18next';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import Card from "@/Components/Card";
import React from "react";
import {Link} from "@inertiajs/react";
import {useLocalizedRoute} from "@/utils/localizedRoute";
import SegmentedBar from '@/Components/SegmentedBar';
import {Segments} from '../../../../types/segments';
import Title from "@/Components/atoms/Title";

interface IdeascaleProfileProps {
    ideascaleProfile: IdeascaleProfileData;
}

const IdeascaleProfileCard: React.FC<IdeascaleProfileProps> = ({
                                                                   ideascaleProfile,
                                                               }) => {
    const {t} = useTranslation();
    const segments = [
        {
            label: 'Completed',
            color: 'bg-success',
            value: ideascaleProfile.completed_proposals_count ?? 0,
        },
        {
            label: 'Funded',
            color: 'bg-warning',
            value: ideascaleProfile.funded_proposals_count ?? 0,
        },
        {
            label: 'Submitted',
            color: 'bg-primary',
            value: ideascaleProfile.proposals_count ?? 0,
        }
    ] as Segments[];

    const extraSegments = [
        {
            label: 'Proposer',
            color: '',
            value: ideascaleProfile.own_proposals_count ?? 0,
        },
        {
            label: 'Collaborator',
            color: '',
            value: ideascaleProfile.collaborating_proposals_count ?? 0,
        },
    ] as Segments[];

    return (
        <Card>
            <div className="relative w-full h-full mb-2">
                <div className="mb-3 flex justify-end">
                    <ListProvider>
                        <BookmarkButton
                            modelType="ideascale-profiles"
                            itemId={ideascaleProfile?.hash ?? '0'}
                        />
                    </ListProvider>
                </div>

                {/* Profile info section */}
                <div className="flex gap-x-2 items-center mb-3">
                    <div className="flex-shrink-0">
                        <UserAvatar
                            imageUrl={ideascaleProfile?.hero_img_url}
                            size="size-12"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-2 font-bold break-words">
                            <Title level='1'>
                                <Link className='line-clamp-2'
                                      href={useLocalizedRoute('ideascaleProfiles.show', {id: ideascaleProfile?.hash})}>
                                    {ideascaleProfile?.name ??
                                        ideascaleProfile?.username}
                                </Link>
                            </Title>
                        </div>
                    </div>
                    <div>{ideascaleProfile.bio}</div>
                </div>
            </div>

            <div className='mt-auto flex flex-col gap-4'>
                <div className="border-border-secondary border-t">
                    <div className="flex w-full justify-between pt-4">
                    <SegmentedBar segments={segments}>
                            {extraSegments.map((segment, index) => (
                                <div key={index} className="flex items-center">
                                    <p className="text-3">{segment.label}:</p>
                                    <p className="text-3 ml-1 font-bold">
                                        {segment.value}
                                    </p>
                                </div>
                            ))}
                        </SegmentedBar>
                    </div>
                </div>

                <div className='flex flex-col gap-2'>
                    <div>
                        Total Requested (Ada + USD) <br/>
                        {ideascaleProfile?.amount_requested_ada} + {ideascaleProfile?.amount_requested_usd}
                    </div>

                    <div>
                        Received VS Awarded Ada <br/>
                        {ideascaleProfile?.amount_distributed_ada} / {ideascaleProfile?.amount_awarded_ada}
                    </div>

                    <div>
                        Received VS Awarded USD <br/>
                        {ideascaleProfile?.amount_distributed_usd} / {ideascaleProfile?.amount_awarded_usd}
                    </div>

                </div>

            </div>
        </Card>
    );
};

export default IdeascaleProfileCard;
