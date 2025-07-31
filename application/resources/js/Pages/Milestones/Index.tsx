import Title from '@/Components/atoms/Title';
import { Head } from '@inertiajs/react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import { PaginatedData } from '../../types/paginated-data';
import { SearchParams } from '../../types/search-params';
import ProjectScheduleData = App.DataTransferObjects.ProjectScheduleData;

interface ActiveFundsProp extends Record<string, unknown> {
    projectSchedules: PaginatedData<ProjectScheduleData[]>;
    filters: SearchParams;
}

const Index: React.FC<ActiveFundsProp> = ({ projectSchedules, filters }) => {
    const { t } = useLaravelReactI18n();

    return (
        <>
            <Head title="Groups" />

            <header>
                <div className="container">
                    <Title level="1">{t('milestones.milestones')}</Title>
                </div>
                <div className="container">
                    <p className="text-content">{t('milestones.milestones')}</p>
                </div>
            </header>

            <div className="flex h-screen w-full flex-col items-center justify-center">
                <Title level="2">{JSON.stringify(projectSchedules)}</Title>
            </div>
        </>
    );
};

export default Index;
