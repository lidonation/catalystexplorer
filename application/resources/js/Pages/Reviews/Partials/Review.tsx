import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import ReviewData = App.DataTransferObjects.ReviewData;
import ReviewHorizontalCard from '@/Pages/Reviews/Partials/ReviewHorizontalCard';
import ReviewHorizontalCardLoader from './ReviewHorizontalCardLoader';

interface ReviewPageProps extends Record<string, unknown> {
    review: ReviewData;
}

const Review: React.FC<ReviewPageProps> = ({ review }) => {
    const { t } = useTranslation();

    return (
        <>
            <Head title="Review" />

            <header>
                <div className="container">
                    <Title level='1'>{t('reviews')}</Title>
                </div>
                <div className="container">
                    <p className="text-content">{review.title}</p>
                </div>
            </header>

            <div className="flex h-full w-full flex-col items-center justify-center">
                <WhenVisible
                        fallback={<ReviewHorizontalCardLoader/>}
                        data="review"
                    >
                        <ReviewHorizontalCard/>
                    </WhenVisible>
                <h1>{t('comingSoon')}</h1>
            </div>
        </>
    );
};

export default Review;
