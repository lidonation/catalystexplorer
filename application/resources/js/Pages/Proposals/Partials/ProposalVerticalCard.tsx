import Title from '@/Components/atoms/Title';
import UserQuickView from '@/Components/UserQuickView';
import ProposalCardFooter from './ProposalCardFooter';
import ProposalCardHeader from './ProposalCardHeader';
import ProposalCardNav from './ProposalCardNav';
import ProposalFundingPercentages from './ProposalFundingPercentages';
import ProposalFundingStatus from './ProposalFundingStatus';
import ProposalQuickpitch from './ProposalQuickpitch';
import ProposalSolution from './ProposalSolution';
import IdeascaleProfileUsers from '@/Pages/IdeascaleProfile/Partials/IdeascaleProfileUsersComponent';
import {useCallback, useState, useRef, useEffect} from 'react';

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
        [handleUserClick]
    );

    const wrappedNoSelectedUser = useCallback(() => {
        if (noSelectedUser) {
            noSelectedUser();
        }
    }, [noSelectedUser]);

    return (
        <article
            ref={cardRef as React.RefObject<HTMLElement>}
            className="bg-background proposal-card proposal-card-vertical flex h-full flex-col justify-between rounded-xl p-2 shadow-lg gap-3 relative"
            style={cardHeight && userSelected ? { height: `${cardHeight}px` } : {}}
            data-testid={`vertical-proposal-card-${proposal?.hash}`}
        >
            {userSelected && (
                <button
                    onClick={wrappedNoSelectedUser}
                    className="absolute right-4 top-4 z-10 rounded-full p-1 hover:bg-background hover:text-content focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Close profile"
                    data-testid="close-profile-button"
                >
                </button>
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

            <section className='flex-1 flex flex-col'>
                <div className="flex-1  px-2">
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
                                className="mt-3 border-b border-gray-200 pb-2 mb-2"
                                aria-labelledby="funding-heading"
                            >
                                <div className="flex items-center flex-row gap-2 my-1.5" data-testid="proposal-funding-status">
                                    <Title level='4' className="font-semibold">
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
                            <div className="relative mt-4 min-h-36 border-b border-gray-200 pb-2 mb-2">
                                {quickPitchView ? (
                                    <span></span>
                                    // reenable when we can replace support ssr.
                                    // <ProposalQuickpitch
                                    //     quickpitch={proposal.quickpitch}
                                    // />
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
                    <Title level="4" id="team-heading" className="font-medium" deta-testid="proposal-team-title">
                        {t('teams')}
                    </Title>
                    <IdeascaleProfileUsers
                        users={proposal?.users}
                        onUserClick={wrappedHandleUserClick}
                        className='bg-content-light'
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
