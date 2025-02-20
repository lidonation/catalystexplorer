import Paragraph from '@/Components/atoms/Paragraph';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
} from '@/Components/atoms/Tooltip';
import Card from '@/Components/Card';
import SegmentedBar from '@/Components/SegmentedBar';
import UserAvatar from '@/Components/UserAvatar';
import { ListProvider } from '@/Context/ListContext';
import BookmarkButton from '@/Pages/My/Bookmarks/Partials/BookmarkButton';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Link } from '@inertiajs/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Segments } from '../../../../types/segments';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;

interface IdeascaleProfileProps {
    ideascaleProfile: IdeascaleProfileData;
}

const IdeascaleProfileCardMini: React.FC<IdeascaleProfileProps> = ({
    ideascaleProfile,
}) => {
    const { t } = useTranslation();
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
        },
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
            <div className="relative mb-2 h-full w-full">
                <div className="mb-3 flex justify-end">
                    <ListProvider>
                        <BookmarkButton
                            modelType="ideascale-profiles"
                            itemId={ideascaleProfile?.hash ?? '0'}
                        />
                    </ListProvider>
                </div>

                {/* Profile info section */}
                <div className="mb-3 flex items-center gap-x-2">
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
                                    <Link
                                        className="line-clamp-2"
                                        href={useLocalizedRoute(
                                            'ideascaleProfiles.show',
                                            {
                                                ideascaleProfile:
                                                    ideascaleProfile?.hash,
                                            },
                                        )}
                                    >
                                        {ideascaleProfile?.name ??
                                            ideascaleProfile?.username}
                                    </Link>
                                    <TooltipContent side="bottom">
                                        <Paragraph size="sm">
                                            {ideascaleProfile?.username}
                                        </Paragraph>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto flex flex-col gap-4">
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

                <div className="border-border-secondary inline-flex w-auto w-fit items-center rounded-lg border px-2.5 py-1">
                    <Paragraph size="sm" className="text-3 text-content">
                        {t('proposals.totalProposals')}:
                    </Paragraph>
                    <Paragraph
                        size="sm"
                        className="text-3 text-content ml-1 font-bold"
                    >
                        {ideascaleProfile?.proposals_count ?? 0}
                    </Paragraph>
                </div>
            </div>
        </Card>
    );
};

export default IdeascaleProfileCardMini;
