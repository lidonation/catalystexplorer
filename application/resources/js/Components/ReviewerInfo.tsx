import { useTranslation } from 'react-i18next';
import Paragraph from './atoms/Paragraph';
import UserAvatar from './UserAvatar';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import { ReviewItem } from '@/Pages/IdeascaleProfile/Reviews/Index';
import ReputationBadge from './ReputationBadge';
import Button from './atoms/Button';

export interface ReviewerInfoProps {
    ideascaleProfile: IdeascaleProfileData;
    reviewCount: number;
    review: ReviewItem;
    className?: string;
}

export const ReviewerInfo: React.FC<ReviewerInfoProps> = ({
    reviewCount,
    review,
    ideascaleProfile,
    className = '',
}) => {
    const { t } = useTranslation();

    return (
        <div className={`flex items-center ${className}`}>
            <ReputationBadge review={review}/>
            <div className="flex flex-col">
                {ideascaleProfile.name ? (
                    <Paragraph className="text-content text-1 font-bold">
                        {ideascaleProfile.name}
                    </Paragraph>
                ) : (
                    <div className="flex items-center">
                        <Paragraph className="font-bold text-content mr-2">
                            #{review.review.id}
                        </Paragraph>
                    </div>
                )}
                <Paragraph className="text-gray-persist text-sm">
                    {reviewCount} {t('reviews')}
                </Paragraph>
            </div>
            
            {!ideascaleProfile.name && (
                <div className="ml-4">
                    <Button 
                        className="bg-primary hover:bg-primary-dark text-light-persist rounded-xl px-4 py-2 transition-colors"
                    >
                        {t('ideascaleProfiles.claim')}
                    </Button>
                </div>
            )}
        </div>
    );
};
