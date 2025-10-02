import Title from '@/Components/atoms/Title';
import UserQuickView from '@/Components/UserQuickView';
import IdeascaleProfileUsers from '@/Pages/IdeascaleProfile/Partials/IdeascaleProfileUsersComponent';
import { useCallback, useRef, useState } from 'react';
import ProposalCardFooter from './ProposalCardFooter';
import ProposalCardHeader from './ProposalCardHeader';
import ProposalCardNav from './ProposalCardNav';
import ProposalFundingPercentages from './ProposalFundingPercentages';
import ProposalFundingStatus from './ProposalFundingStatus';
import ProposalQuickpitch from './ProposalQuickpitch';
import ProposalSolution from './ProposalSolution';

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
    hideFooter = false,
}: any) {
    const [cardHeight, setCardHeight] = useState<number | null>(null);
    const cardRef = useRef<HTMLElement>(null);

    const wrappedHandleUserClick = useCallback(
        (user: any) => {
            if (cardRef.current) {
                setCardHeight(cardRef.current.offsetHeight);
            }
            if (handleUserClick) {
                handleUserClick(user);
            }
        },
        [handleUserClick],
    );

    const wrappedNoSelectedUser = useCallback(() => {
        if (noSelectedUser) {
            noSelectedUser();
        }
    }, [noSelectedUser]);

    return (
        <article
            ref={cardRef as React.RefObject<HTMLElement>}
            className="bg-background proposal-card proposal-card-vertical relative flex h-full flex-col justify-between gap-3 rounded-xl p-2 shadow-lg border border-light-gray-persist"
            style={
                cardHeight && userSelected ? { height: `${cardHeight}px` } : {}
            }
            data-testid={`vertical-proposal-card-${proposal?.id}`}
        >
            {userSelected && (
                <button
                    onClick={wrappedNoSelectedUser}
                    className="hover:bg-background hover:text-content focus:ring-primary absolute top-4 right-4 z-10 rounded-full p-1 focus:ring-2 focus:outline-none"
                    aria-label="Close profile"
                    data-testid="close-profile-button"
                ></button>
            )}

            {/* Changed overflow-hidden to overflow-visible for proper hover expansion */}
            <section className="relative flex h-auto w-full flex-col items-start overflow-visible">
                <ProposalCardHeader
                    proposal={proposal}
                    userSelected={userSelected}
                    noSelectedUser={wrappedNoSelectedUser}
                    isHorizontal={isHorizontal}
                />
            </section>

            <section className="flex flex-1 flex-col">
                <div className="flex-1 px-2">
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
                                className="mt-3 mb-2 border-b border-gray-200 pb-2"
                                aria-labelledby="funding-heading"
                            >
                                <div
                                    className="my-1.5 flex flex-row items-center gap-2"
                                    data-testid="proposal-funding-status"
                                >
                                    <Title level="4" className="font-semibold">
                                        {t('funding')}
                                    </Title>

                                    <ProposalFundingStatus
                                        funding_status={proposal.funding_status}
                                        data-testid="proposal-funding-status-label"
                                    />
                                </div>
                                <ProposalFundingPercentages
                                    proposal={proposal}
                                />
                            </section>
                            <div className="relative mt-4 mb-2 min-h-36 border-b border-gray-200 pb-2">
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
                    data-testid="proposal-team-section"
                >
                    <Title
                        level="4"
                        id="team-heading"
                        className="font-medium"
                        deta-testid="proposal-team-title"
                    >
                        {t('teams')}
                    </Title>
                    <IdeascaleProfileUsers
                        users={proposal?.users}
                        onUserClick={wrappedHandleUserClick}
                        className="bg-content-light"
                        toolTipProps={t('proposals.viewTeam')}
                    />
                </div>

                {!hideFooter && (
                    <>
                        <div className="my-4 border-b"></div>

                        <ProposalCardFooter
                            yesVotes={`${yesVotes}`}
                            abstainVotes={`${abstainVotes}`}
                            t={t}
                        />
                    </>
                )}
            </section>
        </article>
    );
}
