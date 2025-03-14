import RecordsNotFound from '@/Layouts/RecordsNotFound';
import React, { lazy, Suspense } from 'react';
import WorkflowLayout from './WorkflowLayout';
import { ProfileWorkflowProps } from '@/Pages/CompletedProjectNfts/Partials/ProfileWorkflow.jsx';
import { SearchBarProps } from '../CompletedProjectNfts/Partials/ProposalSearchBar';

const WorkflowIndex: React.FC<ProfileWorkflowProps | SearchBarProps> = (
    props: ProfileWorkflowProps | SearchBarProps,
) => {
    const Component = lazy(
        () =>
            import(`@/Pages/CompletedProjectNfts/Partials/ProfileWorkflow.jsx`),
    );

    return (
        <WorkflowLayout>
            <Suspense fallback={<RecordsNotFound />}>
                <div className="flex">
                    {/* {'user' in props ? <Component {...props as ProfileWorkflowProps} /> : null} */}
                </div>
            </Suspense>
        </WorkflowLayout>
    );
};

export default WorkflowIndex;
