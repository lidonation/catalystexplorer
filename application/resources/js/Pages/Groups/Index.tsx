import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import GroupData = App.DataTransferObjects.GroupData;

interface GroupsPageProps extends Record<string, unknown> {
    groups: {
        links: [];
        total: number;
        to: number;
        from: number;
        data: GroupData[];
    };
    search?: string | null;
    sort?: string;
    currPage?: number;
    perPage?: number;
    filters: {
        currentPage?: number;
        perPage?: number;
        funded: boolean;
        awardedUsd: [];
        awardedAda: [];
        funds: [];
        tags: [];
        ideascaleProfile: [];
    };
    filterCounts: {
        tagsCount: [];
        fundsCount: [];
    };
}

const Index: React.FC<GroupsPageProps> = ({ groups }) => {
    const { t } = useTranslation();

    return (
        <>
            <Head title="Groups" />

            <header>
                <div className="container">
                    <h1 className="title-1">{t('groups')}</h1>
                </div>
                <div className="container">
                    <p className="text-content">{t('groupsList')}</p>
                </div>
            </header>

            <div className="flex h-screen w-full flex-col items-center justify-center">
                <h1>{t('comingSoon')}</h1>
            </div>
        </>
    );
};

export default Index;
