import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface ManageProposalProps {
    notSureWhatThisIs?: any[];
}

export default function ManageProposal({}: ManageProposalProps) {
    const { t } = useLaravelReactI18n();

    return (
        <div>
            <Head title={t('proposals.manageProposal')} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="text-content text-center">
                    <RecordsNotFound />
                </div>
            </div>
        </div>
    );
}
