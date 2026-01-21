import Title from '@/Components/atoms/Title';
import { Head, WhenVisible } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import ReviewHorizontalCardLoader from './ReviewHorizontalCardLoader';
import ReviewComments from '@/Components/ReviewComments';
import ReviewData = App.DataTransferObjects.ReviewData;

interface ReviewPageProps extends Record<string, unknown> {
    review: ReviewData;
}

const Review: React.FC<ReviewPageProps> = ({ review }) => {
    const { t } = useLaravelReactI18n();

    return (
        <>
            <Head title="Review" />

            <header>
                <div className="container">
                    <Title level="1">{t('reviews')}</Title>
                </div>
                <div className="container">
                    <p className="text-content">{review.title}</p>
                </div>
            </header>

            <div className="container">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold">{review.content}</h2>
                </div>
            </div>
            <ReviewComments
                reviewId={review.discussion_id}
                team={review.team}
            />
        </>
    );
};

export default Review;
