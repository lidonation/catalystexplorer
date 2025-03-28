import { useTranslation } from 'react-i18next';
import Paragraph from './atoms/Paragraph';
import ReputationBadge from './ReputationBadge';
import Button from './atoms/Button';
import ReviewData = App.DataTransferObjects.ReviewData;
import ValueLabel from "@/Components/atoms/ValueLabel";

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
        <div className={`flex items-center gap-1 ${className}`}>
            <ReputationBadge review={review}/>

            <div className="flex flex-col">
                {( !!review?.reviewer?.claimed_by) ? (
                    <Paragraph className="text-content text-1 font-bold">
                        {review?.reviewer?.claimed_by?.name}
                    </Paragraph>
                ) : (
                    <div className="flex items-center gap-2">
                        <ValueLabel>Reviewer</ValueLabel>
                        <Paragraph className="font-bold text-content mr-2">
                            {review?.reviewer?.catalyst_reviewer_id}
                        </Paragraph>
                    </div>
                )}
                <Paragraph className="text-gray-persist text-sm">
                    {review?.reviewer?.reviews_count ?? '-'} {t('reviews.reviews')}
                </Paragraph>
            </div>
        </div>
    );
};
