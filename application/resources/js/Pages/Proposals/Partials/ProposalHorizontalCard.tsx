import ProposalCardHeader from './ProposalCardHeader';
import ProposalCardNav from './ProposalCardNav';
import ProposalQuickpitch from './ProposalQuickpitch';
import ProposalSolution from './ProposalSolution';
import ProposalFundingPercentages from './ProposalFundingPercentages';
import ProposalCardFooter from './ProposalCardFooter';
import ProposalUsers from './ProposalUsers';
import UserQuickView from '@/Components/UserQuickView';
import ProposalFundingStatus from './ProposalFundingStatus';

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
        <article className="relative flex max-h-screen min-h-[400px] flex-col space-y-4 overflow-auto rounded-xl bg-background p-4 shadow-lg md:flex-row md:space-x-4 md:space-y-0">
            <div className="flex h-auto w-[500px] flex-col items-start overflow-hidden rounded-xl">
                <ProposalCardHeader
                    proposal={proposal}
                    userSelected={userSelected}
                    noSelectedUser={noSelectedUser}
                    isHorizontal={isHorizontal}
                />
            </div>

            <div className="flex flex-grow flex-col space-y-4 overflow-hidden">
                {!userSelected && (
                    <ProposalCardNav
                        quickPitchView={quickPitchView}
                        toggleLocalQuickPitchView={toggleLocalQuickPitchView}
                        hasQuickPitch={hasQuickPitch}
                        t={t}
                    />
                )}

                <div className="flex h-full flex-col space-y-4 md:flex-row md:space-x-6 md:space-y-0">
                    {userSelected ? (
                        <UserQuickView user={userSelected} />
                    ) : (
                        <>
                            <section
                                className="h-full w-full overflow-auto md:w-1/2"
                                aria-labelledby="funding-heading"
                            >
                                <div className='flex gap-2'>
                                    <h3 className="font-semibold">
                                        {t('funding')}
                                    </h3>
                                    <ProposalFundingStatus funding_status={proposal.funding_status} />
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

                <ProposalUsers
                    users={proposal.users}
                    onUserClick={handleUserClick}
                    className="border-t"
                />
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
