import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../types/paginated-data';
import IdeascaleProfileLayout from '../IdeascaleProfileLayout';
import MilestoneAccordion from '../Partials/MilestoneAccordion';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import ProjectScheduleData = App.DataTransferObjects.ProjectScheduleData;

interface MilestonesPageProps {
    ideascaleProfile: IdeascaleProfileData;
    notSureWhatThisIs?: any[];
    projectSchedules: PaginatedData<ProjectScheduleData[]>;
}

export default function Milestones({
    ideascaleProfile,
    projectSchedules,
}: MilestonesPageProps) {
    const { t } = useTranslation();

    return (
        <IdeascaleProfileLayout ideascaleProfile={ideascaleProfile}>
            <Head title={`${ideascaleProfile.name} - Milestones`} />

            <div className="mx-auto">
                <div className="flex flex-col items-center justify-center">
                    <WhenVisible
                        data="projectSchedules"
                        fallback={<div>Loading Connections</div>}
                    >
                        <section className="w-full py-4">
                            {projectSchedules &&
                            projectSchedules.data?.length > 0 ? (
                                <>
                                    <MilestoneAccordion
                                        milestones={
                                            projectSchedules.data[1].milestones
                                        }
                                        totalCost={
                                            projectSchedules.data[1].budget
                                        }
                                        currency={
                                            projectSchedules.data[1].currency
                                        }
                                        onTrack={
                                            projectSchedules.data[1].on_track
                                        }
                                    />
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
