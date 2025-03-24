import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import React from 'react';
import Title from '@/Components/atoms/Title';
import {PaginatedData} from "../../../types/paginated-data";
import {ReviewList} from "@/Components/ReviewList";
import ReviewData = App.DataTransferObjects.ReviewData;

interface ReviewsPageProps extends Record<string, unknown> {
    reviews: PaginatedData<ReviewData[]>;
    search?: string | null;
    sort?: string;
}

const Index: React.FC<ReviewsPageProps> = ({ reviews}) => {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('reviews')} />

            <header>
                <div className="container">
                    <Title level='1'>{t('reviews')}</Title>
                </div>
            </header>

            <div className="flex h-screen w-full flex-col items-center justify-center">
                <section>
                    <Title level='2'>{t('comingSoon')}</Title>
                </section>

                <section>
                    <ReviewList reviews={reviews} />
                </section>
            </div>
        </>
    );
};

export default Index;
