import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import React from 'react';
import Title from '@/Components/atoms/Title';
import {PaginatedData} from "../../../types/paginated-data";
import {ReviewList} from "@/Components/ReviewList";
import ReviewData = App.DataTransferObjects.ReviewData;
import { SearchParams } from '../../../types/search-params';
import { FiltersProvider } from '@/Context/FiltersContext';

interface ReviewsPageProps extends Record<string, unknown> {
    reviews: PaginatedData<ReviewData[]>;
    search?: string | null;
    sort?: string;
    filters: SearchParams;
}

const Index: React.FC<ReviewsPageProps> = ({ reviews, filters }) => {
    const { t } = useTranslation();

    return (
        <FiltersProvider
            defaultFilters={filters}
            routerOptions={{ only: ['reviews'] }}
        >
            <Head title={t('reviews')} />

            <header>
                <div className="container">
                    <Title level="1">{t('reviews')}</Title>
                </div>
            </header>

            <div className="flex  w-full flex-col items-center justify-center">
                <section className='container'>
                    <ReviewList reviews={reviews} />
                </section>
            </div>
        </FiltersProvider>
    );
};

export default Index;
