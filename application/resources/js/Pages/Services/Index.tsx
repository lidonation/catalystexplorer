import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import ServiceCategories from '@/Components/ServiceCategories';
import SearchControls from './Partials/SearchControls';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import ServiceCard from '@/Components/ServiceCard';
import { ServiceData, CategoryData } from '@/types';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Paginator from '@/Components/Paginator';
import { FiltersProvider, useFilterContext } from '@/Context/FiltersContext';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';

const Section = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);

interface ServicesIndexProps {
  services: PaginatedData<ServiceData[]>;
  categories: CategoryData[];
  filters: SearchParams;
}

const ServicesComponent: React.FC<ServicesIndexProps> = ({ services, categories, filters }) => {
  const [search, setSearch] = useState(filters.search || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(filters.categories || []);
  const [showFilters, setShowFilters] = useState(false);
  const { setFilters } = useFilterContext();

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedCategories.length) params.set('categories', selectedCategories.join(','));

      router.get(`/services?${params.toString()}`, {}, {
        preserveState: true,
        preserveScroll: true,
        only: ['services', 'filters']
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategories]);

  const handleCategoryToggle = (categoryHash: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryHash)
        ? prev.filter(h => h !== categoryHash)
        : [...prev, categoryHash]
    );
  };

  const hasActiveFilters = search || selectedCategories.length > 0;
  const hasServices = services?.data?.length > 0;

  return (
    <div className="w-full max-w-full py-4 px-8 xl:px-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-content">Catalyst Services</h1>
          <Paragraph className="text-base text-slate-500">
            A space for Catalyst-funded teams to collaborate, request help, and offer services to the ecosystem.
          </Paragraph>
        </div>
        <PrimaryLink
          className="lg:text-md mb-4 ml-auto px-4 py-2 text-sm text-nowrap"
          href="#"
        >
          + Add Service
        </PrimaryLink>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
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
              onFiltersToggle={() => setShowFilters(!showFilters)}
              showFilters={showFilters}
            />
          </Section>

          {showFilters && (
            <Section className="mb-6 lg:hidden">
              <ServiceCategories
                categories={categories}
                selectedCategories={selectedCategories}
                onCategoryToggle={handleCategoryToggle}
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
                  pagination={services}
                  linkProps={{
                    preserveState: true,
                    preserveScroll: true,
                    only: ['services']
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

const ServicesIndex: React.FC<ServicesIndexProps> = (props) => {
  return (
    <FiltersProvider defaultFilters={props.filters || {} as SearchParams}>
      <ServicesComponent {...props} />
    </FiltersProvider>
  );
};

export default ServicesIndex;
