import { ProfileWorkflowProps } from '@/Pages/CompletedProjectNfts/Partials/ProfileWorkflow.jsx';
import React, { lazy } from 'react';
import { SearchBarProps } from '../CompletedProjectNfts/Partials/ProposalSearchBar';
import WorkflowLayout from './WorkflowLayout';
import LoginForm from '@/Components/LoginForm';
import { useTranslation } from 'react-i18next';
import { useLocalizedRoute } from '@/utils/localizedRoute';

const WorkflowLogin: React.FC<{ title: string; intendedRoute :string}> = ({
    title,
}) => {
    const { t } = useTranslation();

    return (
        <WorkflowLayout asideInfo=''>
            <LoginForm
                title={''}
                postRoute={useLocalizedRoute('workflows.login')}
            />
        </WorkflowLayout>
    );
};

export default WorkflowLogin;
