import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import ReviewData = App.DataTransferObjects.ReviewData;

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
                    <h1 className="title-1">{t('reviews')}</h1>
                </div>
                <div className="container">
                    <p className="text-content">{review.title}</p>
                </div>
            </header>

            <div className="flex h-screen w-full flex-col items-center justify-center">
                <h1>{t('comingSoon')}</h1>
            </div>
        </>
    );
};

export default Review;
