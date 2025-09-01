import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import ServiceCard from '@/Components/ServiceCard';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import Paginator from '@/Components/Paginator';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { FiltersProvider } from '@/Context/FiltersContext';
import SearchControls from '../../Services/Partials/SearchControls';
import { useLaravelReactI18n } from "laravel-react-i18n";
import Title from '@/Components/atoms/Title';
import ServiceData = App.DataTransferObjects.ServiceData;

interface MyServicesProps {
  services: PaginatedData<ServiceData[]>;
  filters: SearchParams;
}

const MyServicesComponent: React.FC<MyServicesProps> = ({ services, filters }) => {
  const { t } = useLaravelReactI18n();
  const [search, setSearch] = useState(filters.search || '');
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (!isNavigating) {
      setSearch(filters.search || '');
    }
  }, [filters, isNavigating]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (search) params.set('search', search);
      router.get(`/my/services?${params.toString()}`, {}, {
        preserveState: true,
        preserveScroll: true,
        only: ['services', 'filters']
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const hasServices = services?.data?.length > 0;

  return (
      <div
          className="w-full max-w-full px-8 py-4 xl:px-20"
          data-testid="my-services-page"
      >
          <Head title="My Service Page" />
          <div className="mb-6 flex items-center justify-between">
              <div>
                  <Title
                      level="1"
                      className="text-content text-2xl font-semibold"
                      data-testid="my-services-page-title"
                  >
                      {t('services.myServices')}
                  </Title>
                  <Paragraph className="text-base text-slate-500">
                      {t('services.myServicesDesc')}
                  </Paragraph>
              </div>
              <PrimaryLink
                  className="lg:text-md mb-4 ml-auto px-4 py-2 text-sm text-nowrap"
                  href={useLocalizedRoute('workflows.createService.index', {
                      step: 1,
                  })}
                  data-testid="add-service-button"
              >
                  + {t('services.AddService')}
              </PrimaryLink>
          </div>

          <section className="mb-6" data-testid="services-search-section">
              <SearchControls
                  search={search}
                  onSearchChange={setSearch}
                  onFiltersToggle={() => {}}
                  showFilters={false}
                  viewType="user"
                  data-testid="my-services-search-controls"
              />
          </section>

          {hasServices ? (
              <>
                  <div
                      className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                      data-testid="my-services-grid"
                  >
                      {services.data.map((service) => (
                          <ServiceCard key={service.id} service={service} />
                      ))}
                  </div>

                  <div className="mt-8 w-full">
                      <Paginator pagination={services} />
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

const MyServices: React.FC<MyServicesProps> = (props) => {
  return (
    <FiltersProvider defaultFilters={props.filters || {}}>
      <MyServicesComponent {...props} />
    </FiltersProvider>
  );
};

export default MyServices;
