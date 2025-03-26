import { useTranslation } from 'react-i18next';
import Paragraph from './atoms/Paragraph';
import ReputationBadge from './ReputationBadge';
import Button from './atoms/Button';
import ReviewData = App.DataTransferObjects.ReviewData;

export interface ReviewerInfoProps {
    review: ReviewData;
    className?: string;
}

export const ReviewerInfo: React.FC<ReviewerInfoProps> = ({
    review,
    className = '',
}) => {
    const { t } = useTranslation();

    return (
        <div className={`flex items-center ${className}`}>
            <ReputationBadge review={review}/>

            <div className="flex flex-col">
                {(typeof review?.reviewer?.claimed_by !== 'undefined') ? (
                    <Paragraph className="text-content text-1 font-bold">
                        {review?.reviewer?.claimed_by?.name}
                    </Paragraph>
                ) : (
                    <div className="flex items-center">
                        <Paragraph className="font-bold text-content mr-2">
                            #{review?.reviewer?.catalyst_reviewer_id}
                        </Paragraph>
                    </div>
                )}
                <Paragraph className="text-gray-persist text-sm">
                    {review?.reviewer?.reviews_count} {t('reviews')}
                </Paragraph>
            </div>

            {!review?.reviewer?.claimed_by && (
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
