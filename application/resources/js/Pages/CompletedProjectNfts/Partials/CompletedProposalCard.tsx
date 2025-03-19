import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import { currency } from '@/utils/currency';
import { useTranslation } from 'react-i18next';
import ProposalData = App.DataTransferObjects.ProposalData;

interface ProposalProps {
    proposal: ProposalData;
}

export default function CompletedProposalCard({ proposal }: ProposalProps) {
    const { t } = useTranslation();

    return (
        <div
            key={proposal.hash}
            className="rounded-lg p-4 shadow-sm w-full "
        >
            <Title level="5" className="font-bold">
                {proposal.title}
            </Title>
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
