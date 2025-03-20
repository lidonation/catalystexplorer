import ProfileWorkflow, { ProfileWorkflowProps } from '@/Pages/CompletedProjectNfts/Partials/ProfileWorkflow.jsx';
import { SearchBarProps } from '@/Pages/CompletedProjectNfts/Partials/ProposalSearchBar';
import React from 'react';
import WorkflowLayout from '../WorkflowLayout';
import { FiltersProvider } from '@/Context/FiltersContext';
import { SearchParams } from '../../../../types/search-params';
import { usePage } from '@inertiajs/react';

const Step1: React.FC<ProfileWorkflowProps & { filters: SearchParams }> = (
    props: ProfileWorkflowProps & { filters: SearchParams },
) => {
        const { auth } = usePage().props;
        const user = auth?.user;
    return (
        <WorkflowLayout asideInfo=''>
            <FiltersProvider
                defaultFilters={props.filters}
                routerOptions={{ only: ['ideascaleProfiles', 'proposals'] }}
            >
                <div className="bg-background mx-auto w-full max-w-lg rounded-2xl p-6 shadow-md"></div>
            </FiltersProvider>
        </WorkflowLayout>
    );
};

export default Step1;
