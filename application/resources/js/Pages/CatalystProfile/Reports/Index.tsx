import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import CatalystProfileLayout from '../CatalystProfileLayout';
import CatalystProfileData = App.DataTransferObjects.CatalystProfileData;

interface ReportsPageProps {
    catalystProfile: CatalystProfileData;
    notSureWhatThisIs?: any[];
}

export default function Reports({ catalystProfile }: ReportsPageProps) {
    const { t } = useLaravelReactI18n();

    return (
        <CatalystProfileLayout catalystProfile={catalystProfile}>
            <Head title={`${catalystProfile.name} - Reports`} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center">
                    <RecordsNotFound />
                </div>
            </div>
        </CatalystProfileLayout>
    );
}
