import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { Head, WhenVisible } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { PaginatedData } from '../../../types/paginated-data';
import CatalystProfileLayout from '../CatalystProfileLayout';
import MilestoneAccordion from '../Partials/MilestoneAccordion';
import CatalystProfileData = App.DataTransferObjects.CatalystProfileData;
import ProjectScheduleData = App.DataTransferObjects.ProjectScheduleData;

interface MilestonesPageProps {
    catalystProfile: CatalystProfileData;
    notSureWhatThisIs?: any[];
    projectSchedules: PaginatedData<ProjectScheduleData[]>;
}

export default function Milestones({
    catalystProfile,
    projectSchedules,
}: MilestonesPageProps) {
    const { t } = useLaravelReactI18n();
    return (
        <CatalystProfileLayout catalystProfile={catalystProfile}>
            <Head title={`${catalystProfile.name} - Milestones`} />

            <div className="mx-auto">
                <div className="flex flex-col items-center justify-center">
                    <WhenVisible
                        data="projectSchedules"
                        fallback={<div>Loading Connections</div>}
                    >
                        <section className="w-full py-4">
                            {projectSchedules?.data &&
                            projectSchedules?.data?.length > 0 ? (
                                <>
                                    <MilestoneAccordion
                                        milestones={
                                            projectSchedules.data[0]?.milestones
                                        }
                                        totalCost={
                                            projectSchedules.data[0]?.budget
                                        }
                                        currency={
                                            projectSchedules.data[0]?.currency
                                        }
                                        onTrack={
                                            projectSchedules.data[0]?.on_track
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
        </CatalystProfileLayout>
    );
}
