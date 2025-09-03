import LoginForm from '@/Components/LoginForm';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React from 'react';
import WorkflowLayout from './WorkflowLayout';

const WorkflowLogin: React.FC<{ title: string; intendedRoute: string }> = ({
    title,
}) => {
    const { t } = useLaravelReactI18n();

    return (
        <WorkflowLayout title="Login" asideInfo="">
            <LoginForm
                title={''}
                postRoute={useLocalizedRoute('workflows.login')}
            />
        </WorkflowLayout>
    );
};

export default WorkflowLogin;
