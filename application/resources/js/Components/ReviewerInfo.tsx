import { useTranslation } from 'react-i18next';
import Paragraph from './atoms/Paragraph';
import UserAvatar from './UserAvatar';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;

export interface ReviewerInfoProps {
    ideascaleProfile: IdeascaleProfileData;
    reviewCount: number;
    className?: string;
}

export const ReviewerInfo: React.FC<ReviewerInfoProps> = ({
    reviewCount,
    ideascaleProfile,
    className = '',
}) => {
    const { t } = useTranslation();

    return (
        <div className={`flex ${ideascaleProfile.name ? 'items-center' : ''} space-x-4 ${className}`}>
            {ideascaleProfile.hero_img_url ? (
                <UserAvatar imageUrl={ideascaleProfile.hero_img_url} size="size-12" />
            ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300"></div>
            )}
            <div className="flex flex-col">
                {ideascaleProfile.name ? (
                    <Paragraph className="text-content text-1 mt-1 font-bold">
                        {ideascaleProfile.name}
                    </Paragraph>
                ) : (
                    <div
                        className={`${ideascaleProfile?.claimed_by_id ? 'bg-success' : 'bg-primary'} text-background w-fit rounded-md px-2 py-3`}
                    >
                        <Paragraph size="sm">
                            {ideascaleProfile?.claimed_by_id
                                ? t('ideascaleProfiles.claimed')
                                : t('ideascaleProfiles.claim')}
                        </Paragraph>
                    </div>
                )}
                <Paragraph className="text-gray-persist text-1">
                    {reviewCount} {t('reviews')}
                </Paragraph>
            </div>
        </div>
    );
};
