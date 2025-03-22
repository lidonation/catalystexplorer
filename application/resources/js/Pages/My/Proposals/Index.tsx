import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import MyLayout from "@/Pages/My/MyLayout";
import RecordsNotFound from '@/Layouts/RecordsNotFound';
<<<<<<< HEAD
=======
import ProposalTable from '@/Pages/Proposals/Partials/ProposalTable';
import ProposalData = App.DataTransferObjects.ProposalData;
import { PaginatedData } from '../../../../types/paginated-data';
import { SearchParams } from '../../../../types/search-params';
import Paginator from '@/Components/Paginator';
>>>>>>> origin/dev

interface MyProposalsProps {
  proposals: PaginatedData<ProposalData[]>;
  filters: SearchParams;
}

export default function MyProposals({ proposals, filters }: MyProposalsProps) {
  const { t } = useTranslation();

  return (
    <MyLayout filters={filters} >
      <Head title={t('my.proposals')}/>

<<<<<<< HEAD
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center text-content">
                    <RecordsNotFound />
                </div>
=======
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {proposals.data && proposals.data.length > 0 ? (
            <div>
               <ProposalTable proposals={proposals.data} /> 
              <div className="mt-8">
                <Paginator pagination={proposals} /> 
              </div>
>>>>>>> origin/dev
            </div>
          ) : (
            <div className="text-center">
              <RecordsNotFound />
            </div>
          )}
      </div>
    </MyLayout>
  );
}
