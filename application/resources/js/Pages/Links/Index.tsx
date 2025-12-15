import React, { useState } from 'react';
import SearchControls from '@/Components/atoms/SearchControls';
import Title from '@/Components/atoms/Title';
import Paragraph from '@/Components/atoms/Paragraph';
import { FiltersProvider } from '@/Context/FiltersContext';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import LinksFilters from './Partials/LinksFilters';
import LinksList from './Partials/LinksList';
import LinksSortOptions from '@/lib/LinksSortOptions';

interface LinksPageProps extends Record<string, unknown> {
    links: PaginatedData<App.DataTransferObjects.LinkData[]>;
    filters: SearchParams;
    queryParams: SearchParams;
    search?: string | null;
    sortBy?: string;
    sortOrder?: string;
    sort?: string;
    modelTypesCount?: Record<string, number>;
    linkTypesCount?: Record<string, number>;
    statusesCount?: Record<string, number>;
}

const Index: React.FC<LinksPageProps> = ({
    links,
    filters,
    queryParams,
    search,
    sortBy,
    sortOrder,
    sort,
    modelTypesCount,
    linkTypesCount,
    statusesCount,
}) => {
    const { t } = useLaravelReactI18n();
    const [showFilters, setShowFilters] = useState(false);

    return (
        <FiltersProvider
            defaultFilters={filters}
            routerOptions={{ only: ['links'] }}
        >
            <Head title={t('links.links')} />

            <header>
                <div className="container">
                    <Title level="1" data-testid="links-page-title">
                        {t('links.links')}
                    </Title>
                </div>

                <div className="container">
                    <Paragraph
                        className="text-content"
                        data-testid="links-page-subtitle"
                    >
                        {t('links.subtitle')}
                    </Paragraph>
                </div>
            </header>

            <section className="container">
                <SearchControls
                    onFiltersToggle={setShowFilters}
                    sortOptions={LinksSortOptions()}
                    searchPlaceholder={t('searchBar.placeholder')}
                />
            </section>

            <section
                className={`container flex w-full flex-col items-center justify-center overflow-hidden transition-[max-height] duration-500 ease-in-out ${
                    showFilters ? 'max-h-[500px] pb-16' : 'max-h-0'
                }`}
            >
                <LinksFilters />
            </section>

            <div className="flex w-full flex-col items-center justify-center">
                <section className="container">
                    <LinksList links={links} />
                </section>
            </div>
        </FiltersProvider>
    );
};

export default Index;
