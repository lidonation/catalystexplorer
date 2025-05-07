import RecordsNotFound from '@/Layouts/RecordsNotFound';
import MyLayout from '@/Pages/My/MyLayout';
import ProposalTable from '@/Pages/Proposals/Partials/ProposalTable';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../../types/paginated-data';
import { SearchParams } from '../../../../types/search-params';
import Paginator from '@/Components/Paginator';
import Title from '@/Components/atoms/Title';
import Paragraph from '@/Components/atoms/Paragraph';
import SearchControls from '@/Components/atoms/SearchControls';
import { FiltersProvider } from '@/Context/FiltersContext';
import ProposalSortingOptions from '@/lib/ProposalSortOptions';
import ProposalFilters from '@/Pages/Proposals/Partials/ProposalFilters';
import ProposalData = App.DataTransferObjects.ProposalData;

interface MyProposalsProps {
    proposals: PaginatedData<ProposalData[]>;
    filters: SearchParams;
}

export default function MyProposals({ proposals, filters }: MyProposalsProps) {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <MyLayout filters={filters}>
      <FiltersProvider defaultFilters={filters} routerOptions={{ only: ['proposals'] }}>
        <Head title={t('my.proposals')}/>

        <div className="pb-8">
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="bg-background overflow-hidden bg-white p-6 shadow-xl sm:rounded-lg">
              <div className="border-b border-background-lighter w-full mb-4">
                <Title level="4" className="mb-4 font-bold">
                  {t('my.proposals')}
                </Title>
              </div>

              <section className="w-full mb-4">
                <SearchControls
                  sortOptions={ProposalSortingOptions()}
                  onFiltersToggle={setShowFilters}
                  searchPlaceholder={t('searchBar.placeholder')}
                />
              </section>

              <section
                className={`w-full flex flex-col items-center justify-center overflow-hidden transition-[max-height] duration-500 ease-in-out ${
                  showFilters ? 'max-h-[500px]' : 'max-h-0'
                }`}
              >
                <ProposalFilters />
              </section>

              <div className="overflow-hidden border border-background-lighter rounded-lg">
                {proposals.data && proposals.data.length > 0 ? (
                  <div>
                    <ProposalTable proposals={proposals.data} />
                    <div className="w-full flex items-center justify-center">
                      <Paginator pagination={proposals} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <RecordsNotFound />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </FiltersProvider>
    </MyLayout>
  );
}