import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import { currency } from '@/utils/currency';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ArrowUpRight } from 'lucide-react';
import ProposalData = App.DataTransferObjects.ProposalData;
import NftData = App.DataTransferObjects.NftData;
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;

interface ProposalProps {
    proposal: ProposalData;
    profileHash: string;
}

export default function CompletedProposalCard({
    proposal,
    profileHash,
}: ProposalProps) {
    const { t } = useLaravelReactI18n();

    return (
        <div
            key={proposal.id}
            className={`flex w-full flex-col items-center justify-between rounded-lg p-4 shadow-sm lg:relative`}
        >
            <div
                className={`w-full ${proposal.minted_nfts_fingerprint ? 'opacity-70' : 'opacity-100'}`}
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

            {proposal.minted_nfts_fingerprint && (
                <div className="right-0 bottom-0 ml-auto flex gap-2 p-2 lg:absolute">
                    {proposal.minted_nfts_fingerprint.map(
                        (fingerprint, index) => (
                            <a
                                href={`https://pool.pm/${fingerprint}`}
                                target="_blank "
                                className="hover:bg-background-tertiary hover:text-content-secondary focus:bg-background-accent active:bg-background-tertiary bg-primary active:text-content-secondary text-content-light relative inline-flex w-auto cursor-pointer items-center justify-center rounded-md p-1 text-sm tracking-widest whitespace-nowrap transition duration-150 ease-in-out focus:ring-0 focus:ring-offset-0 focus:outline-hidden"
                            >
                                {t('workflows.completedProjectNfts.viewNft') +
                                    ` ${proposal.minted_nfts_fingerprint && proposal.minted_nfts_fingerprint.length > 1 ? index + 1 : ''}`}
                                <ArrowUpRight className="text-sm" />
                            </a>
                        ),
                    )}
                </div>
            )}
        </div>
    );
}
