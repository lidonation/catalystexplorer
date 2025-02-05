import UserAvatar from '@/Components/UserAvatar';
import { useTranslation } from 'react-i18next';
import SegmentedBar from './SegmentedProgressBar';
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
        </div>
    );
};

export default IdeascaleProfileCard;
