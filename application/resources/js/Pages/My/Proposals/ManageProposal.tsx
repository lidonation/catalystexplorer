import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import QuickPitchWidget from './partials/QuickPitchWidget';

interface ManageProposalProps {
    proposal: {
        id: string;
        title: string;
        quickpitch?: string;
        quickpitch_length?: number;
    };
}

export default function ManageProposal({ proposal }: ManageProposalProps) {
    const { t } = useLaravelReactI18n();

    return (
        <div>
            <Head title={t('proposals.manageProposal')} />

            <div className="container py-8">
                <div className="mx-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {t('proposals.managingProposal', { title: proposal.title })}
                        </h1>
                        <p className="text-gray-600">
                            {t('proposals.manageDescription')}
                        </p>
                    </div>

                    <div className="grid grid-cols-16 gap-6">
                        <div className='col-span-5'>
                            <QuickPitchWidget proposal={proposal} />
                        </div>

                        {/* Future widgets will be added here */}
                    </div>
                </div>
            </div>
        </div>
    );
}
