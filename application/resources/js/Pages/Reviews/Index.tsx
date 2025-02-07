import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import ReviewData = App.DataTransferObjects.ReviewData;
import React from 'react';

interface ReviewsPageProps extends Record<string, unknown> {
    reviews: {
        data: ReviewData[];
    };
    search?: string | null;
    sort?: string;
    currPage?: number;
    perPage?: number;
}

const Index: React.FC<ReviewsPageProps> = ({ reviews}) => {
    const { t } = useTranslation();

    return (
        <>
            <Head title='Reviews'/>

            <header>
                <div className="container">
                    <h1 className="title-1">{t('reviews')}</h1>
                </div>
            </header>

            <div className="flex h-screen w-full flex-col items-center justify-center">
                <h1>{t('comingSoon')}</h1>
            </div>
        </>
    );
};

export default Index;
