import Paragraph from '@/Components/atoms/Paragraph';
import { currency } from '@/utils/currency';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import ProposalData = App.DataTransferObjects.ProposalData;

interface ProposalProps {
    proposal: ProposalData;
}

export default function CompletedProposalCard({ proposal }: ProposalProps) {
    const { t } = useTranslation();

    const localizedRoute = useLocalizedRoute('completedProjectsNfts.show', {
        proposal: proposal?.hash,
    });

    return (
        <div
            key={proposal.hash}
            className="cursor-pointer rounded-lg border border-gray-200 p-4 shadow-sm"
            onClick={() => router.visit(localizedRoute)}
        >
            <h4 className="font-bold">{proposal.title}</h4>
            <Paragraph className="text-sm">
                <strong>{t('profileWorkflow.budget')}:</strong>{' '}
                <span className="text-success">
                    {' '}
                    {currency(
                        proposal.amount_requested ?? 0,
                        undefined,
                        proposal?.currency,
                    )}{' '}
                    &nbsp;{' '}
                </span>
                <strong>{t('profileWorkflow.fund')}:</strong>{' '}
                <span className="text-primary">
                    {' '}
                    {proposal.fund?.label} &nbsp;{' '}
                </span>
                <strong>{t('profileWorkflow.campaign')}:</strong>{' '}
                <span> {proposal.campaign?.label} </span>
            </Paragraph>
        </div>
    );
}
