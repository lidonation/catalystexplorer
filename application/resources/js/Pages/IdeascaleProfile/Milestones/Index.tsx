import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import IdeascaleProfileLayout from '../IdeascaleProfileLayout';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import ProjectScheduleData = App.DataTransferObjects.ProjectScheduleData;

interface MilestonesPageProps {
    ideascaleProfile: IdeascaleProfileData;
    notSureWhatThisIs?: any[];
    projectSchedules: ProjectScheduleData[] | null;
}

export default function Milestones({
    ideascaleProfile,
    projectSchedules,
}: MilestonesPageProps) {
    const { t } = useTranslation();

    return (
        <IdeascaleProfileLayout ideascaleProfile={ideascaleProfile}>
            <Head title={`${ideascaleProfile.name} - Milestones`} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center">
                    <WhenVisible
                        data="projectSchedules"
                        fallback={<div>Loading Connections</div>}
                    >
                        <section className="container py-8">
                            {projectSchedules ? (
                                <>
                                    <h4 className="title-4">
                                        {t('comingSoon')}
                                    </h4>
                                    <div>
                                        {JSON.stringify(projectSchedules)}
                                    </div>
                                </>
                            ) : (
                                <RecordsNotFound context="projectSchedules" />
                            )}
                        </section>
                    </WhenVisible>
                </div>
            </div>
        </IdeascaleProfileLayout>
    );
}
