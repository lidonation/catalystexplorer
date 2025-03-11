import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import RecordsNotFound from '@/Layouts/RecordsNotFound';

interface ManageProposalProps {
    notSureWhatThisIs?: any[];
}

export default function ManageProposal({}: ManageProposalProps) {
    
    const { t } = useTranslation();

    return (
        <div >
            <Head title={t('proposals.manageProposal')} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center text-content">
                    <RecordsNotFound />
                </div>
            </div>
       </div>
    );
}
