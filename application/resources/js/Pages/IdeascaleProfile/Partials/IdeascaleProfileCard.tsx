import UserAvatar from '@/Components/UserAvatar';
import { ListProvider } from '@/Context/ListContext';
import BookmarkButton from '@/Pages/My/Bookmarks/Partials/BookmarkButton';
import { useTranslation } from 'react-i18next';

import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;

interface IdeascaleProfileProps {
    ideascaleProfile: IdeascaleProfileData;
}

const IdeascaleProfileCard: React.FC<IdeascaleProfileProps> = ({
    ideascaleProfile,
}) => {
    const { t } = useTranslation();

    return (
        <div className="bg-background w-full overflow-hidden rounded-xl p-3 shadow-xs sm:p-4">
            <div className="relative w-full">
                <div className="mb-3 flex justify-end">
                    <ListProvider>
                        <BookmarkButton
                            modelType="ideascale_profiles"
                            itemId={ideascaleProfile?.id}
                        />
                    </ListProvider>
                </div>

                {/* Profile info section */}
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                        <UserAvatar
                            imageUrl={ideascaleProfile?.profile_photo_url}
                            size="size-12"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-2 font-bold break-words">
                            {ideascaleProfile?.name ??
                                ideascaleProfile?.username}
                        </p>
                    </div>
                </div>

                {/* Stats section */}
                <div className="border-border-secondary mt-4 border-t-2 pt-4">
                    <div className="mb-4 grid grid-cols-2 gap-2">
                        <p className="text-4 text-content truncate opacity-70">
                            {t('ideascaleProfiles.ownProposals')}
                        </p>
                        <p className="text-3 text-right font-semibold">
                            {ideascaleProfile?.own_proposals_count ?? 0}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <p className="text-4 text-content truncate opacity-70">
                            {t('ideascaleProfiles.coProposals')}
                        </p>
                        <p className="text-3 text-right font-semibold">
                            {ideascaleProfile?.co_proposals_count ?? 0}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IdeascaleProfileCard;
