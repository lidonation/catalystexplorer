import Title from '@/Components/atoms/Title';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface PageHeaderProps {
    sectionTitle: string;
    userName?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ sectionTitle, userName }) => {
    const { t } = useTranslation();

    return (
        <>
            <Title level='2' className="max-w-xs mx-auto text-lg font-semibold text-center">
                {t("profileWorkflow.nowMinting")}: <span className="font-bold">{t("profileWorkflow.fundsRange")}</span>
            </Title>
            <p className="max-w-xs mx-auto mt-1 text-sm text-center">
                {t("profileWorkflow.loggedInAs")} <span className="font-semibold text-primary">{userName}</span>
            </p>
            <p className="max-w-xs mx-auto my-2 text-sm text-center">{sectionTitle}</p>
        </>
    );
};

export default PageHeader;
