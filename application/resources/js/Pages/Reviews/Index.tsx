import SearchControls from '@/Components/atoms/SearchControls';
import Title from '@/Components/atoms/Title';
import { ReviewList } from '@/Components/ReviewList';
import { FiltersProvider } from '@/Context/FiltersContext';
import ReviewsSortOptions from '@/lib/ReviewsSortOptions';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { Head } from '@inertiajs/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReviewsFilter from './Partials/ReviewsFilters';
import ReviewData = App.DataTransferObjects.ReviewData;

interface ReviewsPageProps extends Record<string, unknown> {
    reviews: PaginatedData<ReviewData[]>;
    funds: any;
    search?: string | null;
    sort?: string;
    filters: SearchParams;
}

const Index: React.FC<ReviewsPageProps> = ({
    reviews,
    filters,
    funds,
    sort,
    search,
}) => {
    const { t } = useTranslation();
    const [showFilters, setShowFilters] = useState(false);

    return (
        <FiltersProvider
            defaultFilters={filters}
            routerOptions={{ only: ['reviews'] }}
        >
            <Head title={t('reviews.reviews')} />

            <header>
                <div className="container">
                    <Title level="1">{t('reviews.reviews')}</Title>
                </div>
            </header>

            <section className="container">
                <SearchControls
                    onFiltersToggle={setShowFilters}
                    sortOptions={ReviewsSortOptions()}
                    searchPlaceholder={t('searchBar.placeholder')}
                />
            </section>

            <section
                className={`container flex w-full flex-col items-center justify-center overflow-hidden transition-[max-height] duration-500 ease-in-out ${
                    showFilters ? 'max-h-[500px]' : 'max-h-0'
                }`}
            >
                <ReviewsFilter />
            </section>

            <div className="flex w-full flex-col items-center justify-center">
                <section className="container">
                    <ReviewList reviews={reviews} />
                </section>
            </div>
        </FiltersProvider>
    );
};

export default Index;
