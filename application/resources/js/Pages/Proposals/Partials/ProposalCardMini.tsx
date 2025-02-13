import ProposalCardHeader from '@/Pages/Proposals/Partials/ProposalCardHeader';
import ProposalFundingPercentages from '@/Pages/Proposals/Partials/ProposalFundingPercentages';
import ProposalFundingStatus from '@/Pages/Proposals/Partials/ProposalFundingStatus';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Proposal = App.DataTransferObjects.ProposalData;
import Title from '@/Components/atoms/Title';
import IdeascaleProfileUsers from '@/Pages/IdeascaleProfile/Partials/IdeascaleProfileUsersComponent';

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
        <article className="bg-background relative flex h-full flex-col justify-between rounded-xl p-2 shadow-lg">
            <section className="flex h-auto w-full flex-col items-start overflow-hidden rounded-xl">
                <ProposalCardHeader
                    proposal={proposal}
                    userSelected={userSelected}
                    noSelectedUser={noSelectedUser}
                    isHorizontal={isHorizontal}
                />
            </section>
            <section>
                <div className="mt-4" aria-labelledby="funding-heading">
                    <div className="flex gap-2">
                        <Title level='3' className="font-semibold">{t('funding')}</Title>
                        <ProposalFundingStatus
                            funding_status={proposal.funding_status}
                        />
                    </div>
                    <ProposalFundingPercentages proposal={proposal}/>
                </div>
                <div className="border-t mt-3 border-t-dark/30">
                    <IdeascaleProfileUsers
                        users={proposal.users}
                        onUserClick={handleUserClick}
                    />
                </div>
            </section>
        </article>
    );
}
