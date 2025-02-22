import React from 'react';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import IdeascaleProfileLayout from '../IdeascaleProfileLayout';

interface MilestonesPageProps {
    ideascaleProfile: IdeascaleProfileData;
    notSureWhatThisIs?: any[];
}

export default function Milestones({ideascaleProfile}: MilestonesPageProps) {
    const { t } = useTranslation();

    return (
        <IdeascaleProfileLayout ideascaleProfile={ideascaleProfile}>
              <Head title={`${ideascaleProfile.name} - Milestones`} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col items-center justify-center">
                    <RecordsNotFound />
                </div>
            </div>
        </IdeascaleProfileLayout>
    );
}