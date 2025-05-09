import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import { currency } from '@/utils/currency';
import { useTranslation } from 'react-i18next';
import ProposalData = App.DataTransferObjects.ProposalData;
import { useEffect } from 'react';

interface ProposalProps {
    proposal: ProposalData;
}

export default function CompletedProposalCard({ proposal}: ProposalProps) {
    const { t } = useTranslation(); 

    return (
        <div
            key={proposal.hash}
            className={`flex flex-row flex-col w-full items-center justify-between rounded-lg p-4 shadow-sm`}
        >
            <div
                className={`w-full ${proposal?.completed_project_nft?.required_nft_metadata?.fingerprint ? 'opacity-70' : 'opacity-100'}`}
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
            {proposal?.completed_project_nft?.required_nft_metadata?.fingerprint && (
                <PrimaryLink
                    href={`https://pool.pm/${proposal?.completed_project_nft?.required_nft_metadata?.fingerprint}`}
                    className="w-auto text-sm whitespace-nowrap lg:px-8 lg:py-3"
                >
                    {t('workflows.completedProjectNfts.viewNft')}
                </PrimaryLink>
            )}
        </div>
    );
}
