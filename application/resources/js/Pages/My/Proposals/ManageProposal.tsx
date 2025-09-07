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

            <div className="container py-8 ">
                <div className="text-content text-center">
                    <RecordsNotFound context='proposals' />
                </div>
            </div>
        </div>
    );
}
