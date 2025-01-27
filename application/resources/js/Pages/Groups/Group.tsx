import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import GroupData = App.DataTransferObjects.GroupData;

interface GroupPageProps extends Record<string, unknown> {
    group: GroupData;
}

const Group: React.FC<GroupPageProps> = ({ group }) => {
    const { t } = useTranslation();

    return (
        <>
            <Head title="Group" />

            <header>
                <div className="container">
                    <h1 className="title-1">Groups</h1>
                </div>
                <div className="container">
                    <p className="text-content">{group.name}</p>
                </div>
            </header>

            <div className="flex h-screen w-full flex-col items-center justify-center">
                <h1>{t('comingSoon')}</h1>
            </div>
        </>
    );
};

export default Group;
