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
import {Tooltip, TooltipContent, TooltipProvider} from "@/Components/atoms/Tooltip";
import Paragraph from '@/Components/atoms/Paragraph';

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
            value: ideascaleProfile.completed_proposals_count,
        },
        {
            label: 'Funded',
            color: 'bg-warning',
            value: ideascaleProfile.funded_proposals_count,
        },
        {
            label: 'Submitted',
            color: 'bg-primary',
            value: ideascaleProfile.proposals_count,
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
                            imageUrl={ideascaleProfile?.profile_photo_url}
                            size="size-12"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-2 font-bold break-words">
                            <TooltipProvider>
                                <Tooltip>
                                    <Link className='line-clamp-2'
                                          href={useLocalizedRoute('ideascaleProfiles.show', {id: ideascaleProfile?.hash})}>
                                        {ideascaleProfile?.name ?? ideascaleProfile?.username}
                                    </Link>
                                    <TooltipContent side="bottom">
                                        <Paragraph>
                                            {ideascaleProfile?.username}
                                        </Paragraph>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </div>
            </div>

            <div className='mt-auto flex flex-col gap-4'>
                <div className="border-border-secondary border-t">
                    <div className="flex w-full justify-between pt-4">
                        <SegmentedBar segments={segments}/>
                    </div>
                </div>

                <div className="border-border-secondary inline-flex items-center rounded-lg border px-2.5 py-1">
                    <Paragraph className="text-3 text-content">
                        {t('proposals.totalProposals')}:
                    </Paragraph>
                    <Paragraph className="text-3 text-content ml-1 font-bold">
                        {ideascaleProfile?.proposals_count ?? 0}
                    </Paragraph>
                </div>
            </div>
        </Card>
    );
};

export default IdeascaleProfileCard;
