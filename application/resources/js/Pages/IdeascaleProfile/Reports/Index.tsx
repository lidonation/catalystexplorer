import React from 'react';
import { Head } from '@inertiajs/react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import IdeascaleProfileLayout from '../IdeascaleProfileLayout';

interface ReportsPageProps {
    ideascaleProfile: IdeascaleProfileData;
    notSureWhatThisIs?: any[];
}

export default function Reports({ideascaleProfile}: ReportsPageProps) {
    const { t } = useLaravelReactI18n();

    return (
        <IdeascaleProfileLayout ideascaleProfile={ideascaleProfile}>
              <Head title={`${ideascaleProfile.name} - Reports`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col items-center justify-center">
                    <RecordsNotFound />
                </div>
            </div>
        </IdeascaleProfileLayout>
    );
}
