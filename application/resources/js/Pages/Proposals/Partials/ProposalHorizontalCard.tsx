import ProposalCardHeader from './ProposalCardHeader';
import ProposalCardNav from './ProposalCardNav';
import ProposalQuickpitch from './ProposalQuickpitch';
import ProposalSolution from './ProposalSolution';
import ProposalFundingPercentages from './ProposalFundingPercentages';
import ProposalCardFooter from './ProposalCardFooter';
import ProposalUsers from './ProposalUsers';
import UserQuickView from '@/Components/UserQuickView';

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
        <article className="relative flex flex-col md:flex-row rounded-xl bg-background p-4 shadow-lg md:space-x-4 space-y-4 md:space-y-0 min-h-[400px] max-h-screen overflow-auto">
        <div className="flex flex-col w-[500px] overflow-hidden h-auto items-start rounded-xl">
            <ProposalCardHeader
                proposal={proposal}
                userSelected={userSelected}
                noSelectedUser={noSelectedUser}
                isHorizontal={isHorizontal}
            />
        </div>

        <div className="flex flex-col flex-grow space-y-4 overflow-hidden">
            {!userSelected && (
                <ProposalCardNav
                    quickPitchView={quickPitchView}
                    toggleLocalQuickPitchView={toggleLocalQuickPitchView}
                    hasQuickPitch={hasQuickPitch}
                    t={t}
                />
            )}
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 h-full">
                {userSelected ? (
                    <UserQuickView user={userSelected} />
                ) : (
                    <>
                        <section
                            className="w-full md:w-1/2 h-full overflow-auto"
                            aria-labelledby="funding-heading"
                        >
                            <h3 className="font-semibold">{t('funding')}</h3>
                            <ProposalFundingPercentages proposal={proposal} />
                            <ProposalUsers
                                users={proposal.users}
                                onUserClick={handleUserClick}
                            />
                        </section>
                        <div className="w-[500px] min-h-40 h-full overflow-auto">
                            {quickPitchView ? (
                                <ProposalQuickpitch quickpitch={proposal.quickpitch} />
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
            {!quickPitchView && (
                <ProposalUsers
                    users={proposal.users}
                    onUserClick={handleUserClick}
                    className="border-t"
                />
            )}
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
