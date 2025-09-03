import Title from '@/Components/atoms/Title';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React from 'react';

interface PageHeaderProps {
    sectionTitle: string;
    userName?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ sectionTitle, userName }) => {
    const { t } = useLaravelReactI18n();

    return (
        <>
            <Title
                level="2"
                className="mx-auto max-w-xs text-center text-lg font-semibold"
            >
                {t('profileWorkflow.nowMinting')}:{' '}
                <span className="font-bold">
                    {t('profileWorkflow.fundsRange')}
                </span>
            </Title>
            <p className="mx-auto mt-1 max-w-xs text-center text-sm">
                {t('profileWorkflow.loggedInAs')}{' '}
                <span className="text-primary font-semibold">{userName}</span>
            </p>
            <p className="mx-auto my-2 max-w-xs text-center text-sm">
                {sectionTitle}
            </p>
        </>
    );
};

export default PageHeader;
