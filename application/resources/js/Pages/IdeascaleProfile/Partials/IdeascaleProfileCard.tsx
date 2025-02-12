import UserAvatar from '@/Components/UserAvatar';
import {ListProvider} from '@/Context/ListContext';
import BookmarkButton from '@/Pages/My/Bookmarks/Partials/BookmarkButton';
import {useTranslation} from 'react-i18next';
import SegmentedBar from './SegmentedProgressBar';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import Card from "@/Components/Card";
import React from "react";
import {Link} from "@inertiajs/react";
import {useLocalizedRoute} from "@/utils/localizedRoute";

interface IdeascaleProfileProps {
    ideascaleProfile: IdeascaleProfileData;
}

const IdeascaleProfileCard: React.FC<IdeascaleProfileProps> = ({
                                                                   ideascaleProfile,
                                                               }) => {
    const {t} = useTranslation();
    return (
        <Card>
            <div className="relative w-full">
                <div className="mb-3 flex justify-end">
                    <ListProvider>
                        <BookmarkButton
                            modelType="ideascale-profiles"
                            itemId={ideascaleProfile?.hash ?? '0'}
                        />
                    </ListProvider>
                </div>

                {/* Profile info section */}
                <div className="flex gap-x-3 items-center mb-3">
                    <div className="flex-shrink-0">
                        <UserAvatar
                            imageUrl={ideascaleProfile?.profile_photo_url}
                            size="size-12"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-2 font-bold break-words">
                            <Link href={useLocalizedRoute('ideascaleProfiles.show', {id: ideascaleProfile?.hash})}>
                                {ideascaleProfile?.name ??
                                    ideascaleProfile?.username}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats section */}
            <div className="border-border-secondary border-t">
                <div className="flex w-full justify-between pt-4 pb-4">
                    <SegmentedBar
                        IdeascaleProfileData={ideascaleProfile}
                        CompletedProposalsColor="bg-success"
                        FundedProposalsColor="bg-warning"
                        UnfundedProposalsColor="bg-primary"
                    />
                </div>
            </div>
            <div className="border-border-secondary mt-4 inline-flex items-center rounded-lg border border-2 px-4 py-2">
                <p className="text-3 text-content">
                    {t('proposals.totalProposals')}:
                </p>
                <p className="text-3 text-content ml-1 font-bold">
                    {ideascaleProfile?.proposals_count ?? 0}
                </p>
            </div>
        </Card>
    );
};

export default IdeascaleProfileCard;
