import {useLaravelReactI18n} from "laravel-react-i18n";
import ProposalLayout from "../ProposalLayout";
import MilestoneAccordion from '@/Pages/IdeascaleProfile/Partials/MilestoneAccordion.tsx';
import RecordsNotFound from '@/Layouts/RecordsNotFound.tsx';
import { WhenVisible } from '@inertiajs/react';

interface IndexProps {
    proposal: App.DataTransferObjects.ProposalData;
    globalQuickPitchView: boolean;
    setGlobalQuickPitchView?: (value: boolean) => void;
}

const Index = ({
    proposal,
    globalQuickPitchView,
    setGlobalQuickPitchView
}: IndexProps) => {
    const { t } = useLaravelReactI18n();

    return (
        <ProposalLayout
            proposal={proposal}
            globalQuickPitchView={globalQuickPitchView}
            setGlobalQuickPitchView={setGlobalQuickPitchView}
        >
            <div>
                <WhenVisible
                    data="schedule"
                    fallback={<div className='cx-box-shadow rounded-xl bg-background p-16'>Loading Schedule Milestones</div>}
                >
                    <section className="w-full py-4 bg-background shadow-cx-box-shadow rounded-xl">
                        {proposal?.schedule ? (
                            <>
                                <MilestoneAccordion
                                    milestones={
                                        proposal?.schedule.milestones
                                    }
                                    totalCost={
                                        proposal?.schedule.budget
                                    }
                                    currency={
                                        proposal?.schedule.currency
                                    }
                                    onTrack={
                                        proposal?.schedule?.on_track || false
                                    }
                                />
                            </>
                        ) : (
                            <RecordsNotFound context="projectSchedules" />
                        )}
                    </section>
                </WhenVisible>
            </div>
        </ProposalLayout>
    );
};

export default Index;
