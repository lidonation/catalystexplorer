import LoginForm from '@/Components/LoginForm';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import React from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import WorkflowLayout from './WorkflowLayout';

const WorkflowLogin: React.FC<{ title: string; intendedRoute: string }> = ({
    title,
}) => {
    const { t } = useLaravelReactI18n();

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
