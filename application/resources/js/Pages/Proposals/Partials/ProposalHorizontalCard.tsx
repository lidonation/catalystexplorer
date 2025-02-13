import Title from '@/Components/atoms/Title';
import UserQuickView from '@/Components/UserQuickView';
import IdeascaleProfileUsers from '@/Pages/IdeascaleProfile/Partials/IdeascaleProfileUsersComponent';
import ProposalCardFooter from './ProposalCardFooter';
import ProposalCardHeader from './ProposalCardHeader';
import ProposalCardNav from './ProposalCardNav';
import ProposalFundingPercentages from './ProposalFundingPercentages';
import ProposalFundingStatus from './ProposalFundingStatus';
import ProposalQuickpitch from './ProposalQuickpitch';
import ProposalSolution from './ProposalSolution';

export default function ProposalHorizontalCard({
    proposal,
    userSelected,
    noSelectedUser,
    handleUserClick,
    quickPitchView,
    toggleLocalQuickPitchView,
    isHorizontal,
    t,
    hasQuickPitch,
    yesVotes,
    abstainVotes,
}: any) {
    return (
        <article className="bg-background proposal-card proposal-card-horizontal relative flex max-h-screen min-h-[400px] flex-col space-y-4 overflow-auto rounded-xl p-4 shadow-lg md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex h-auto w-[500px] flex-col items-start overflow-hidden rounded-xl">
                <ProposalCardHeader
                    proposal={proposal}
                    userSelected={userSelected}
                    noSelectedUser={noSelectedUser}
                    isHorizontal={isHorizontal}
                />
            </div>

            <div className="flex grow flex-col space-y-4 overflow-hidden">
                {!userSelected && (
                    <ProposalCardNav
                        quickPitchView={quickPitchView}
                        toggleLocalQuickPitchView={toggleLocalQuickPitchView}
                        hasQuickPitch={hasQuickPitch}
                        t={t}
                    />
                )}

                <div className="flex h-full flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-6">
                    {userSelected ? (
                        <UserQuickView user={userSelected} />
                    ) : (
                        <>
                            <section
                                className="h-full w-full overflow-auto md:w-1/2"
                                aria-labelledby="funding-heading"
                            >
                                <div className="flex gap-2">
                                    <Title level="3" className="font-semibold">
                                        {t('funding')}
                                    </Title>
                                    <ProposalFundingStatus
                                        funding_status={proposal.funding_status}
                                    />
                                </div>
                                <ProposalFundingPercentages
                                    proposal={proposal}
                                />
                            </section>
                            <div className="h-full min-h-40 w-[500px] overflow-auto">
                                {quickPitchView ? (
                                    <ProposalQuickpitch
                                        quickpitch={proposal.quickpitch}
                                    />
                                ) : (
                                    <ProposalSolution
                                        solution={proposal.solution}
                                        slug={proposal.slug}
                                    />
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div
                    className={`flex items-center justify-between pt-3`}
                    aria-labelledby="team-heading"
                >
                    <Title level="4" id="team-heading" className="font-medium">
                        {t('teams')}
                    </Title>
                    <IdeascaleProfileUsers
                        users={proposal?.users}
                        onUserClick={handleUserClick}
                    />
                </div>

                <div className="mt-auto">
                    <ProposalCardFooter
                        yesVotes={`${yesVotes}`}
                        abstainVotes={`${abstainVotes}`}
                        t={t}
                    />
                </div>
            </div>
        </article>
    );
}
