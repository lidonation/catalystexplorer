import ProposalCardHeader from './ProposalCardHeader';
import ProposalCardNav from './ProposalCardNav';
import ProposalQuickpitch from './ProposalQuickpitch';
import ProposalSolution from './ProposalSolution';
import ProposalFundingPercentages from './ProposalFundingPercentages';
import ProposalCardFooter from './ProposalCardFooter';
import ProposalUsers from './ProposalUsers';
import UserQuickView from '@/Components/UserQuickView';
import ProposalFundingStatus from './ProposalFundingStatus';

export default function ProposalVerticalCard({
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
        <article className="relative flex h-full flex-col rounded-xl bg-background p-2 shadow-lg">
            <div className="flex h-auto w-full flex-col items-start overflow-hidden">
                <ProposalCardHeader
                    proposal={proposal}
                    userSelected={userSelected}
                    noSelectedUser={noSelectedUser}
                    isHorizontal={isHorizontal}
                />
            </div>

            <div className="flex-grow overflow-auto p-2">
                {userSelected ? (
                    <UserQuickView user={userSelected} />
                ) : (
                    <>
                        <ProposalCardNav
                            quickPitchView={quickPitchView}
                            toggleLocalQuickPitchView={
                                toggleLocalQuickPitchView
                            }
                            hasQuickPitch={hasQuickPitch}
                            t={t}
                        />
                        <section
                            className="mt-6"
                            aria-labelledby="funding-heading"
                        >
                            <div className="flex gap-2">
                                <h3 className="font-semibold">
                                    {t('funding')}
                                </h3>
                                <ProposalFundingStatus
                                    funding_status={proposal.funding_status}
                                />
                            </div>
                            <ProposalFundingPercentages proposal={proposal} />
                        </section>
                        <div className="my-4 border-b"></div>
                        <div className="relative mb-4 min-h-40">
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
            <div className="my-4 border-b"></div>
            <ProposalCardFooter
                yesVotes={`${yesVotes}`}
                abstainVotes={`${abstainVotes}`}
                t={t}
            />
        </article>
    );
}
