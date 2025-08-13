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
import {useCallback, useState, useRef, useEffect} from 'react';

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
                                                   hideFooter = false,
                                               }: any) {
    const [cardHeight, setCardHeight] = useState<number | null>(null);
    const [cardWidth, setCardWidth] = useState<number | null>(null);
    const cardRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (cardRef.current && !cardHeight) {
            const height = cardRef.current.offsetHeight;
            const width = cardRef.current.offsetWidth;
            setCardHeight(height);
            setCardWidth(width);
        }
    }, [cardHeight]);

    useEffect(() => {
        const handleResize = () => {
            if (cardRef.current && !userSelected) {
                setCardHeight(cardRef.current.offsetHeight);
                setCardWidth(cardRef.current.offsetWidth);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [userSelected]);

    useEffect(() => {
        if (cardRef.current && !userSelected) {
            setCardHeight(cardRef.current.offsetHeight);
            setCardWidth(cardRef.current.offsetWidth);
        }
    }, [userSelected]);

    const wrappedNoSelectedUser = useCallback(() => {
        if (noSelectedUser) noSelectedUser();
    }, [noSelectedUser]);

    return (
        <article
            ref={cardRef as React.RefObject<HTMLElement>}
            className="bg-background proposal-card proposal-card-horizontal relative flex min-h-[400px] flex-col space-y-4 overflow-auto rounded-xl p-4 shadow-lg md:flex-row md:space-y-0 md:space-x-4"
            style={cardHeight && userSelected ? {
                height: `${cardHeight}px`,
                width: cardWidth ? `${cardWidth}px` : 'auto'
            } : {}}
            data-testid={`horizontal-proposal-card-${proposal?.id}`}
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
                        <UserQuickView user={userSelected}/>
                    ) : (
                        <>
                            <section
                                className="h-full w-full overflow-auto md:w-1/2"
                                aria-labelledby="funding-heading"
                            >
                                <div className="flex gap-2" data-testid="proposal-funding-status">
                                    <Title level="3" className="font-semibold">
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
                    data-testid="proposal-team-section"
                >
                    <Title level="4" id="team-heading" className="font-medium" deta-testid="proposal-team-title">
                        {t('teams')}
                    </Title>
                    <IdeascaleProfileUsers
                        users={proposal?.users}
                        onUserClick={handleUserClick}
                        className='bg-content-light'
                        toolTipProps={t('proposals.viewTeam')}
                    />
                </div>

                {!hideFooter && (
                    <div className="mt-auto">
                        <ProposalCardFooter
                            yesVotes={`${yesVotes}`}
                            abstainVotes={`${abstainVotes}`}
                            t={t}
                        />
                    </div>
                )}
            </div>
        </article>
    );
}
