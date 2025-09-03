import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface MyCommunitiesProps {
    communities?: any[];
}

export default function MyCommunities({}: MyCommunitiesProps) {
    const { t } = useLaravelReactI18n();

    return (
        <>
            <Head title="My Communities" />

            <div className="w-full max-w-full px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center">
                    <RecordsNotFound />
                </div>
            </div>
        </>
    );
}
