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
        <WorkflowLayout>
            <FiltersProvider
                defaultFilters={props.filters}
                routerOptions={{ only: ['ideascaleProfiles', 'proposals'] }}
            >
                <ProfileWorkflow {...props} user={user} />
            </FiltersProvider>
        </WorkflowLayout>
    );
};

export default Step1;
