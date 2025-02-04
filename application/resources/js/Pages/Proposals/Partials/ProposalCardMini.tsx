import ProposalCardHeader from '@/Pages/Proposals/Partials/ProposalCardHeader';
import ProposalFundingPercentages from '@/Pages/Proposals/Partials/ProposalFundingPercentages';
import ProposalFundingStatus from '@/Pages/Proposals/Partials/ProposalFundingStatus';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Proposal = App.DataTransferObjects.ProposalData;
import ProposalUsersMini from './ProposalUsersMini';

interface ProposalCardMiniProps {
    proposal: Proposal;
    isHorizontal: boolean;
}
export default function ProposalCardMini({
    proposal,
    isHorizontal
}: ProposalCardMiniProps) {
    const { t } = useTranslation();

    const [userSelected, setUserSelected] =
        useState<App.DataTransferObjects.IdeascaleProfileData | null>(null);

    const handleUserClick = useCallback(
        (user: App.DataTransferObjects.IdeascaleProfileData) =>
            setUserSelected(user),
        [],
    );

    const noSelectedUser = useCallback(() => setUserSelected(null), []);
    return (
        <article className="bg-background relative flex h-full flex-col rounded-xl p-2 shadow-lg">
            <div className="flex h-auto w-full flex-col items-start overflow-hidden rounded-xl">
                <ProposalCardHeader
                    proposal={proposal}
                    userSelected={userSelected}
                    noSelectedUser={noSelectedUser}
                    isHorizontal={isHorizontal}
                />
            </div>
            <div className="mt-6" aria-labelledby="funding-heading">
                <div className="flex gap-2">
                    <h3 className="font-semibold">{t('funding')}</h3>
                    <ProposalFundingStatus
                        funding_status={proposal.funding_status}
                    />
                </div>
                <ProposalFundingPercentages proposal={proposal} />
            </div>
            <div className="border-t mt-4 border-t-dark/30">
                <ProposalUsersMini
                    users={proposal.users}
                    onUserClick={handleUserClick}
                />
            </div>
        </article>
    );
}
