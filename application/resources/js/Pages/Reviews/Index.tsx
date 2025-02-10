import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import ReviewData = App.DataTransferObjects.ReviewData;
import React from 'react';
import Title from '@/Components/atoms/Title';

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
                    <Title level='1'>{t('reviews')}</Title>
                </div>
            </header>

            <div className="flex h-screen w-full flex-col items-center justify-center">
                <Title level='2'>{t('comingSoon')}</Title>
            </div>
        </>
    );
};

export default Index;
