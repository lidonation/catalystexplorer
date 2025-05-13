import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import { currency } from '@/utils/currency';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
    const completedProjectNft = proposal?.completed_project_nft || [];
    const filteredNfts = completedProjectNft?.filter(
        (nft: NftData) => nft?.profile_hash === profileHash,
    );
    const hasFilteredNft = filteredNfts && filteredNfts.length > 0;
    const isNftMinted = hasFilteredNft && filteredNfts[0]?.status === 'minted';

    return (
        <div
            key={proposal.hash}
            className={`flex w-full flex-col flex-row items-center justify-between rounded-lg p-4 shadow-sm`}
        >
            <div
                className={`w-full ${isNftMinted ? 'opacity-70' : 'opacity-100'}`}
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
            {isNftMinted && (
                <div>
                    <PrimaryLink
                        href={`https://pool.pm/${filteredNfts[0]?.required_nft_metadata?.fingerprint}`}
                        className="w-auto text-sm whitespace-nowrap lg:px-8 lg:py-3"
                    >
                        {t('workflows.completedProjectNfts.viewNft')}
                    </PrimaryLink>
                    <Paragraph className="text-gray-persist/70 mt-2">
                        {t('workflows.completedProjectNfts.alreadyMinted')}
                    </Paragraph>
                </div>
            )}
        </div>
    );
}
