import LoginForm from '@/Components/LoginForm';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import React from 'react';
import { useTranslation } from 'react-i18next';
import WorkflowLayout from './WorkflowLayout';

const WorkflowLogin: React.FC<{ title: string; intendedRoute: string }> = ({
    title,
}) => {
    const { t } = useTranslation();

    return (
        <WorkflowLayout asideInfo="">
            <LoginForm
                title={''}
                postRoute={useLocalizedRoute('workflows.login')}
            />
        </WorkflowLayout>
    );
};

export default WorkflowLogin;
