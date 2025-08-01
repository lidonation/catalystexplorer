import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import ServiceCategories from '@/Components/ServiceCategories';
import SearchControls from './Partials/SearchControls';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import ServiceCard from '@/Components/ServiceCard';
import { ServiceData, CategoryData } from '@/types';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import { FiltersProvider } from '@/Context/FiltersContext';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import {useLaravelReactI18n} from "laravel-react-i18n";
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import Paginator from '@/Components/Paginator';
import ServiceTypeFilter from './Partials/ServiceTypeFilter';

const Section = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);

interface ServicesIndexProps {
  services: PaginatedData<ServiceData[]>;
  categories: CategoryData[];
  filters?: SearchParams;
}

const DEFAULT_FILTERS = {
  search: '',
  categories: [],
  type: null,
  sort: 'newest',
  viewType: 'all'
};

const ServicesComponent: React.FC<ServicesIndexProps> = ({
  services,
  categories,
  filters = DEFAULT_FILTERS
}) => {
    const { t } = useLaravelReactI18n();
  const initialCategories = typeof filters.categories === 'string'
    ? filters.categories.split(',')
    : Array.isArray(filters.categories)
      ? filters.categories
      : [];

  const [search, setSearch] = useState(filters.search || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(filters?.type || null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedCategories.length) params.set('categories', selectedCategories.join(','));
      if (selectedType) params.set('type', selectedType);
      router.get(`/services?${params.toString()}`, {}, {
        preserveState: true,
        preserveScroll: true,
        only: ['services', 'filters']
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategories, selectedType, filters?.sort]);

  const handleCategoryToggle = (categoryHash: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryHash)
        ? prev.filter(h => h !== categoryHash)
        : [...prev, categoryHash]
    );
  };

  const hasServices = services?.data?.length > 0;

  return (
    <div className="w-full max-w-full py-4 px-8 xl:px-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-content">{t('services.catalystServices')}</h1>
          <Paragraph className="text-base text-slate-500"> {t('services.catalystServicesDesc')}
          </Paragraph>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 md-grid-cols-2 gap-8 items-start">
        <div className="hidden lg:block lg:col-span-1">
          <section className="sticky top-8">
            <ServiceCategories
              categories={categories}
              selectedCategories={selectedCategories}
              onCategoryToggle={handleCategoryToggle}
            />
          </section>
        </div>

        <div className="lg:col-span-3">
          <Section className="mb-6">
            <SearchControls
              search={search}
              onSearchChange={setSearch}
              onFiltersToggle={() => setShowTypeFilter(!showTypeFilter)}
              showFilters={showTypeFilter}
            />
          </Section>

          {showTypeFilter && (
            <Section className="mb-6">
              <ServiceTypeFilter
                selectedType={selectedType}
                onTypeChange={setSelectedType}
              />
            </Section>
          )}

          {hasServices ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {services.data.map(service => (
                  <ServiceCard key={`${service.hash}-${service.id}`} service={service} />
                ))}
              </div>
              <div className="mt-8 w-full">
                  <Paginator
                    pagination={{
                      ...services,
                      links: services.links
                    }}
                    linkProps={{
                      preserveScroll: true,
                      preserveState: true,
                      only: ['services', 'filters']
                    }}
                  />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <RecordsNotFound />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ServicesIndex: React.FC<ServicesIndexProps> = ({ filters, ...props }) => {
  return (
    <div className="isolate">
      <FiltersProvider defaultFilters={filters || DEFAULT_FILTERS}>
        <ServicesComponent
          {...props}
          filters={filters || DEFAULT_FILTERS}
        />
      </FiltersProvider>
    </div>
  );
};

export default ServicesIndex;
