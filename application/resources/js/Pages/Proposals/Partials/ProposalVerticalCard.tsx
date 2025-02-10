import ProposalCardHeader from './ProposalCardHeader';
import ProposalCardNav from './ProposalCardNav';
import ProposalQuickpitch from './ProposalQuickpitch';
import ProposalSolution from './ProposalSolution';
import ProposalFundingPercentages from './ProposalFundingPercentages';
import ProposalCardFooter from './ProposalCardFooter';
import ProposalUsers from './ProposalUsers';
import UserQuickView from '@/Components/UserQuickView';
import ProposalFundingStatus from './ProposalFundingStatus';
import Title from '@/Components/atoms/Title';

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
        <article className="bg-background relative flex h-full flex-col rounded-xl justify-between p-2 shadow-lg proposal-card proposal-card-vertical">
            <section className="flex h-auto w-full flex-col items-start overflow-hidden">
                <ProposalCardHeader
                    proposal={proposal}
                    userSelected={userSelected}
                    noSelectedUser={noSelectedUser}
                    isHorizontal={isHorizontal}
                />
            </section>

            <section>
                <div className="grow overflow-auto p-2">
                    {userSelected ? (
                        <UserQuickView user={userSelected}/>
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
                                className="mt-3"
                                aria-labelledby="funding-heading"
                            >
                                <div className="flex gap-2 my-1">
                                    <Title level='3' className="font-semibold">
                                        {t('funding')}
                                    </Title>
                                    <ProposalFundingStatus
                                        funding_status={proposal.funding_status}
                                    />
                                </div>
                                <ProposalFundingPercentages proposal={proposal}/>
                            </section>
                            {/*<div className="my-3 border-b"></div>*/}
                            <div className="relative min-h-36 mt-4">
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
            </section>
        </article>
    );
}
