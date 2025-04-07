import React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ProposalData = App.DataTransferObjects.ProposalData;
import { VoteEnum } from '@/enums/votes-enums';
import Paragraph from '@/Components/atoms/Paragraph';
import ValueLabel from '@/Components/atoms/ValueLabel';
import Button from '@/Components/atoms/Button';
import { currency } from '@/utils/currency';

interface ProposalVotingCardProps {
    proposal: ProposalData;
    isSelected: boolean;
    onSelect: (proposalSlug: string) => void;
    onVote?: (proposalSlug: string, vote: VoteEnum) => void;
    currentVote?: VoteEnum;
}

const ProposalVotingCard: React.FC<ProposalVotingCardProps> = ({ 
    proposal, 
    isSelected, 
    onSelect, 
    onVote, 
    currentVote 
}) => {
    const { t } = useTranslation();

    const formatCurrency = (
        amount: number | string | null | undefined,
        currencyCode?: string,
    ): string =>
        currency(
            amount ? parseInt(amount.toString()) : 0,
            2,
            currencyCode || 'USD'
        ) as string;

    const amountRequested = proposal.amount_requested
        ? proposal.amount_requested
        : 0;

    const currencyCode = proposal.currency || 'USD';
    const formattedAmountRequested = formatCurrency(
        amountRequested,
        currencyCode,
    );
    
    return (
        <div className="flex items-center ml-4 mr-2 p-4 border border-gray-200 rounded-lg shadow-sm mb-4">
            <div
                className={`w-4 h-4 mr-4 flex-shrink-0 rounded border flex items-center justify-center cursor-pointer ${isSelected ? 'bg-primary border-primary' : 'border-gray-300'}`}
                onClick={(e) => {
                    e.stopPropagation();
                    if (typeof proposal.slug === 'string') {
                        onSelect(proposal.slug);
                    }
                }}
            >
                {isSelected && <Check className="w-4 h-4 text-white" />}
            </div>

            <div className="max-w-3xl w-full">
                <div className="flex items-center gap-2 mb-2">
                    <Paragraph className="font-bold text-content" size="md">{proposal.title}</Paragraph>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 mb-4">
                    <div className="flex items-center">
                        <ValueLabel className="font-bold text-content">{t('workflows.voterList.proposalCard.budget')}</ValueLabel>
                        <Paragraph size="sm" className="ml-1 text-success">{formattedAmountRequested}</Paragraph>
                    </div>

                    <div className="flex items-center">
                        <ValueLabel className="font-bold text-content">{t('workflows.voterList.proposalCard.fund')}</ValueLabel>
                        <Paragraph size="sm" className="ml-1 text-primary">{proposal?.fund?.title}</Paragraph>
                    </div>

                    <div className="flex items-center">
                        <ValueLabel className="font-bold text-content">{t('workflows.voterList.proposalCard.campaign')}</ValueLabel>
                        <Paragraph size="sm" className="ml-1 text-content">{proposal?.campaign?.title}</Paragraph>
                    </div>
                </div>

                <div className="flex w-full gap-4 mt-4">
                    <Button
                        className={`flex-1 ${currentVote === VoteEnum.YES ? 'bg-success text-white' : 'bg-success-light text-success'} border border-success hover:bg-success hover:text-white py-2 rounded-md font-medium transition`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (typeof proposal.slug === 'string' && onVote) {
                                onVote(proposal.slug, VoteEnum.YES);
                            }
                        }}
                        ariaLabel={t('workflows.voterList.proposalCard.voteYes')}
                    >
                        {t('workflows.voterList.proposalCard.voteYes')}
                    </Button>
                    <Button
                        className={`flex-1 ${currentVote === VoteEnum.ABSTAIN ? 'bg-warning text-white' : 'bg-warning-light text-warning'} border border-warning hover:bg-warning hover:text-white py-2 rounded-md font-medium transition`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (typeof proposal.slug === 'string' && onVote) {
                                onVote(proposal.slug, VoteEnum.ABSTAIN);
                            }
                        }}
                        ariaLabel={t('workflows.voterList.proposalCard.voteAbstain')}
                    >
                        {t('workflows.voterList.proposalCard.voteAbstain')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProposalVotingCard;