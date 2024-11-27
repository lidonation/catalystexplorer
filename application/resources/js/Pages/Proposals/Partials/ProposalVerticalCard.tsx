import ProposalCardHeader from './ProposalCardHeader';
import ProposalCardNav from './ProposalCardNav';
import ProposalQuickpitch from './ProposalQuickpitch';
import ProposalSolution from './ProposalSolution';
import ProposalFundingPercentages from './ProposalFundingPercentages';
import ProposalCardFooter from './ProposalCardFooter';
import ProposalUsers from './ProposalUsers';
import UserQuickView from '@/Components/UserQuickView';

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
        <article className="relative flex flex-col h-full rounded-xl bg-background p-2 shadow-lg">
            <div className="flex flex-col w-full overflow-hidden h-auto items-start">
                <ProposalCardHeader
                    proposal={proposal}
                    userSelected={userSelected}
                    noSelectedUser={noSelectedUser}
                    isHorizontal={isHorizontal}
                />
            </div>

            <div className="flex-grow p-2 overflow-auto">
                {userSelected ? (
                    <UserQuickView user={userSelected} />
                ) : (
                    <>
                        <ProposalCardNav
                            quickPitchView={quickPitchView}
                            toggleLocalQuickPitchView={toggleLocalQuickPitchView}
                            hasQuickPitch={hasQuickPitch}
                            t={t}
                        />
                        <section className="mt-6" aria-labelledby="funding-heading">
                            <h3 className="font-semibold">{t('funding')}</h3>
                            <ProposalFundingPercentages proposal={proposal} />
                        </section>
                        <div className="my-4 border-b"></div>
                        <div className="relative mb-4 min-h-40">
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
            <ProposalUsers users={proposal.users} onUserClick={handleUserClick} className="border-t" />
            <div className="my-4 border-b"></div>
            <ProposalCardFooter
                yesVotes={`${yesVotes}`}
                abstainVotes={`${abstainVotes}`}
                t={t}
            />
        </article>
    );
}
