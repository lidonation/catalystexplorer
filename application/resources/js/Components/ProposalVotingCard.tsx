import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';
import ValueLabel from '@/Components/atoms/ValueLabel';
import { VoteEnum } from '@/enums/votes-enums';
import { currency } from '@/utils/currency';
import { Check } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ProposalData = App.DataTransferObjects.ProposalData;

interface ProposalVotingCardProps {
    proposal: ProposalData;
    isSelected: boolean;
    onVote: (hash: string, vote: number | null) => void;
    currentVote?: number | null;
}

const ProposalVotingCard: React.FC<ProposalVotingCardProps> = ({
    proposal,
    isSelected,
    onVote,
    currentVote,
}) => {
    const { t } = useTranslation();

    const formatCurrency = (
        amount: number | string | null | undefined,
        currencyCode?: string,
    ): string =>
        currency(
            amount ? parseInt(amount.toString()) : 0,
            2,
            currencyCode || 'USD',
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
        <div className="mr-2 mb-4 ml-4 flex items-center rounded-lg border border-gray-200 p-4 shadow-sm">
            <div
                className={`mr-4 flex h-4 w-4 flex-shrink-0 cursor-pointer items-center justify-center rounded border ${isSelected ? 'bg-primary border-primary' : 'border-gray-300'}`}
                onClick={(e) => {
                    e.stopPropagation();
                    if (typeof proposal.hash === 'string') {
                        onVote(proposal.hash, null);
                    }
                }}
            >
                {isSelected && <Check className="h-4 w-4 text-white" />}
            </div>

            <div className="w-full max-w-3xl">
                <div className="mb-2 flex items-center gap-2">
                    <Paragraph className="text-content font-bold" size="md">
                        {proposal.title}
                    </Paragraph>
                </div>

                <div className="mt-4 mb-4 flex flex-wrap gap-x-6 gap-y-2">
                    <div className="flex items-center">
                        <ValueLabel className="text-content font-bold">
                            {t('workflows.voterList.proposalCard.budget')}
                        </ValueLabel>
                        <Paragraph size="sm" className="text-success ml-1">
                            {formattedAmountRequested}
                        </Paragraph>
                    </div>

                    <div className="flex items-center">
                        <ValueLabel className="text-content font-bold">
                            {t('workflows.voterList.proposalCard.fund')}
                        </ValueLabel>
                        <Paragraph size="sm" className="text-primary ml-1">
                            {proposal?.fund?.title}
                        </Paragraph>
                    </div>

                    <div className="flex items-center">
                        <ValueLabel className="text-content font-bold">
                            {t('workflows.voterList.proposalCard.campaign')}
                        </ValueLabel>
                        <Paragraph size="sm" className="text-content ml-1">
                            {proposal?.campaign?.title}
                        </Paragraph>
                    </div>
                </div>

                <div className="mt-4 flex w-full gap-4">
                    <Button
                        className={`flex-1 ${currentVote === VoteEnum.YES ? 'bg-success text-white' : 'bg-success-light text-success'} border-success hover:bg-success rounded-md border py-2 font-medium transition hover:text-white`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (typeof proposal.hash === 'string' && onVote) {
                                onVote(proposal.hash, VoteEnum.YES);
                            }
                        }}
                        ariaLabel={t(
                            'workflows.voterList.proposalCard.voteYes',
                        )}
                    >
                        {t('workflows.voterList.proposalCard.voteYes')}
                    </Button>
                    <Button
                        className={`flex-1 ${currentVote === VoteEnum.ABSTAIN ? 'bg-warning text-white' : 'bg-warning-light text-warning'} border-warning hover:bg-warning rounded-md border py-2 font-medium transition hover:text-white`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (typeof proposal.hash === 'string' && onVote) {
                                onVote(proposal.hash, VoteEnum.ABSTAIN);
                            }
                        }}
                        ariaLabel={t(
                            'workflows.voterList.proposalCard.voteAbstain',
                        )}
                    >
                        {t('workflows.voterList.proposalCard.voteAbstain')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProposalVotingCard;
