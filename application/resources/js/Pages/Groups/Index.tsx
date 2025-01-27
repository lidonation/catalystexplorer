import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import GroupData = App.DataTransferObjects.GroupData;

interface HomePageProps extends Record<string, unknown> {
    groups: {
        links: [];
        total: number;
        to: number;
        from: number;
        data: GroupData[];
    };
}

const Index: React.FC<HomePageProps> = ({ groups }) => {
    const { t } = useTranslation();

    return (
        <>
            <Head title="Groups" />

            <header>
                <div className="container">
                    <h1 className="title-1">Groups</h1>
                </div>
                <div className="container">
                    <p className="text-content">Groups list</p>
                </div>
            </header>

            <div className="flex h-screen w-full flex-col items-center justify-center">
                <h1>{t('comingSoon')}</h1>
            </div>
        </>
    );
};

export default Index;
