import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import ServiceCard from '@/Components/ServiceCard';
import { ServiceData } from '@/types';
import Card from '@/Components/Card';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Paginator from '@/Components/Paginator';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { FiltersProvider } from '@/Context/FiltersContext';
import SearchControls from '../../Services/Partials/SearchControls';

interface MyServicesProps {
  services: PaginatedData<ServiceData[]>;
  filters: SearchParams;
}

const MyServicesComponent: React.FC<MyServicesProps> = ({ services, filters }) => {
  const [search, setSearch] = useState(filters.search || '');
  const [isNavigating, setIsNavigating] = useState(false);

  // Sync search state with URL params when they change (but not during navigation)
  useEffect(() => {
    if (!isNavigating) {
      setSearch(filters.search || '');
    }
  }, [filters, isNavigating]);

  // Handle search with debouncing
  useEffect(() => {
    if (isNavigating) return;

    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();

      // Set search if exists
      if (search.trim()) {
        params.set('search', search.trim());
      }

      // Get current URL search params for comparison
      const currentParams = new URLSearchParams(window.location.search);
      const currentSearch = currentParams.get('search') || '';

      // Only navigate if search has actually changed
      if (search.trim() !== currentSearch) {
        setIsNavigating(true);

        const queryString = params.toString();
        const newUrl = queryString ? `/my/services?${queryString}` : '/my/services';

        router.get(newUrl, {}, {
          preserveState: true,
          replace: true,
          only: ['services', 'filters'],
          onFinish: () => setIsNavigating(false)
        });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, isNavigating]);

  const handleClearFilters = () => {
    setSearch('');
  };

  const hasActiveFilters = search;
  const hasServices = services?.data?.length > 0;

  return (
    <div className="w-full max-w-full py-4 px-8 xl:px-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-content">My Services</h1>
          <Paragraph className="text-base text-slate-500">
            Manage your services and collaborate with the Catalyst ecosystem.
          </Paragraph>
        </div>
        <PrimaryLink
          className="lg:text-md mb-4 ml-auto px-4 py-2 text-sm text-nowrap"
          href="/services/create"
        >
          + Add Service
        </PrimaryLink>
      </div>
      <section className="mb-6">
        <SearchControls
          search={search}
          onSearchChange={setSearch}
          onFiltersToggle={() => {}}
          showFilters={false}
          viewType="user"
        />
      </section>

      {/* Services Grid or No Results */}
      {hasServices ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {services.data.map(service => (
              <ServiceCard key={`${service.hash}-${service.id}`} service={service} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 w-full">
            <Paginator
              pagination={services}
              linkProps={{
                preserveState: true,
                only: ['services', 'filters'],
                replace: true,
                onStart: () => setIsNavigating(true),
                onFinish: () => setIsNavigating(false)
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
  );
};

// Main component that provides the context
const MyServices: React.FC<MyServicesProps> = (props) => {
  return (
    <FiltersProvider defaultFilters={props.filters || {} as SearchParams}>
      <MyServicesComponent {...props} />
    </FiltersProvider>
  );
};

export default MyServices;
