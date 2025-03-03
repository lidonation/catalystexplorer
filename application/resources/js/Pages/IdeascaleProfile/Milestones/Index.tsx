import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import IdeascaleProfileLayout from '../IdeascaleProfileLayout';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import ProposalMilestoneData = App.DataTransferObjects.ProposalMilestoneData;

interface MilestonesPageProps {
    ideascaleProfile: IdeascaleProfileData;
    notSureWhatThisIs?: any[];
    proposalMilestones: ProposalMilestoneData[] | null;
}

export default function Milestones({
    ideascaleProfile,
    proposalMilestones,
}: MilestonesPageProps) {
    const { t } = useTranslation();

    return (
        <IdeascaleProfileLayout ideascaleProfile={ideascaleProfile}>
            <Head title={`${ideascaleProfile.name} - Milestones`} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center">
                    <WhenVisible
                        data="proposalMilestones"
                        fallback={<div>Loading Connections</div>}
                    >
                        <section className="container py-8">
                            {proposalMilestones ? (
                                <>
                                    <h4 className="title-4">
                                        {t('comingSoon')}
                                    </h4>
                                    <div>
                                        {JSON.stringify(proposalMilestones)}
                                    </div>
                                </>
                            ) : (
                                <RecordsNotFound context="proposalMilestones" />
                            )}
                        </section>
                    </WhenVisible>
                </div>
            </div>
        </IdeascaleProfileLayout>
    );
}
