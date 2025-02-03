import UserAvatar from '@/Components/UserAvatar';
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
        <div className="bg-background w-full rounded-xl p-4 shadow-xs">
            <div className="mb-2 w-full">
                <div>
                    <UserAvatar
                        imageUrl={ideascaleProfile?.profile_photo_url}
                        size="size-12"
                    />
                </div>
                <p className="text-2 mt-2 font-bold md:truncate">
                    {ideascaleProfile?.name ?? ideascaleProfile?.username}
                </p>
            </div>
            <div className="border-border-secondary border-t-2">
                <div className="flex w-full justify-between pt-2 pb-4">
                    <p className="text-4 text-content opacity-70">
                        {t('ideascaleProfiles.ownProposals')}
                    </p>
                    <p className="text-3 font-semibold">
                        {ideascaleProfile?.own_proposals_count ?? 0}
                    </p>
                </div>
                <div className="flex w-full justify-between">
                    <p className="text-4 text-content opacity-70">
                        {t('ideascaleProfiles.coProposals')}
                    </p>
                    <p className="text-3 font-semibold">
                        {ideascaleProfile?.co_proposals_count ?? 0}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default IdeascaleProfileCard;
