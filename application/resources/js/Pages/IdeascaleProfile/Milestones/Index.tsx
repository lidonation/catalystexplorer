<<<<<<< HEAD
import React from 'react';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import IdeascaleProfileLayout from '../IdeascaleProfileLayout';
=======
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import IdeascaleProfileLayout from '../IdeascaleProfileLayout';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import ProposalMilestoneData = App.DataTransferObjects.ProposalMilestoneData;
>>>>>>> origin/dev

interface MilestonesPageProps {
    ideascaleProfile: IdeascaleProfileData;
    notSureWhatThisIs?: any[];
<<<<<<< HEAD
}

export default function Milestones({ideascaleProfile}: MilestonesPageProps) {
=======
    proposalMilestones: ProposalMilestoneData[] | null;
}

export default function Milestones({
    ideascaleProfile,
    proposalMilestones,
}: MilestonesPageProps) {
>>>>>>> origin/dev
    const { t } = useTranslation();

    return (
        <IdeascaleProfileLayout ideascaleProfile={ideascaleProfile}>
<<<<<<< HEAD
              <Head title={`${ideascaleProfile.name} - Milestones`} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col items-center justify-center">
                    <RecordsNotFound />
=======
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
>>>>>>> origin/dev
                </div>
            </div>
        </IdeascaleProfileLayout>
    );
<<<<<<< HEAD
}
=======
}
>>>>>>> origin/dev
