import Title from '@/Components/atoms/Title';
import { Head, WhenVisible } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import ReviewHorizontalCardLoader from './ReviewHorizontalCardLoader';
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

            <div className="flex h-full w-full flex-col items-center justify-center">
                <WhenVisible
                    fallback={<ReviewHorizontalCardLoader />}
                    data="review"
                >
                    <h1>{t('comingSoon')}</h1>

                    {/* <ReviewHorizontalCard /> */}
                </WhenVisible>
                <h1>{t('comingSoon')}</h1>
            </div>
        </>
    );
};

export default Review;
