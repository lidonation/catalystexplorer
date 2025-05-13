import Title from '@/Components/atoms/Title';
import UserQuickView from '@/Components/UserQuickView';
import ProposalCardFooter from './ProposalCardFooter';
import ProposalCardHeader from './ProposalCardHeader';
import ProposalCardNav from './ProposalCardNav';
import ProposalFundingDetails from './ProposalFundingDetails';
import ProposalFundingStatus from './ProposalFundingStatus';
import ProposalSolution from './ProposalSolution';
import IdeascaleProfileUsers from '@/Pages/IdeascaleProfile/Partials/IdeascaleProfileUsersComponent';
import { useCallback, useState, useRef } from 'react';
import Rating from '@/Components/Rating';
import ValueLabel from '@/Components/atoms/ValueLabel';
import Button from '@/Components/atoms/Button';

export default function ProposalExtendedCard({
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
        >
            {userSelected && (
                <Button
                    onClick={wrappedNoSelectedUser}
                    className="absolute right-4 top-4 z-10 rounded-full p-1 hover:bg-background hover:text-content focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Close profile" 
                    children={undefined}                
                />
            )}
            
            <section className="relative flex h-auto w-full flex-col items-start overflow-visible">
                <ProposalCardHeader
                    proposal={proposal}
                    userSelected={userSelected}
                    noSelectedUser={wrappedNoSelectedUser}
                    isHorizontal={isHorizontal}
                />
            </section>

            <section className='flex-1 flex flex-col'>
                <div className="flex-1 overflow-auto px-2">
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
                                className="mt-3"
                                aria-labelledby="funding-heading"
                            >
                                <div className="flex items-center flex-row justify-between my-1.5">
                                    <Title level='4' className="font-semibold">
                                        {t('funding')}
                                    </Title>

                                    <ProposalFundingStatus
                                        funding_status={proposal.funding_status}
                                    />
                                </div>
                                <ProposalFundingDetails
                                    proposal={proposal}
                                />
                            </section>
                            <div className="relative mt-2 min-h-36">
                                <ProposalSolution
                                    solution={proposal.solution}
                                    problem={proposal.problem}
                                    slug={proposal.slug}
                                />
                            </div>
                            <div className="relative mt-2 border-t border-b border-gray-persist pt-2 pb-2">
                                <div className='flex items-center justify-between mb-2'>
                                    <ValueLabel>{t('proposals.impactAlignment')}</ValueLabel>
                                    <Rating 
                                        filledClassName="fill-primary text-primary"
                                        rating={proposal.alignment_score}
                                        showValue={false}
                                    />
                                </div>
                                <div className='flex items-center justify-between mb-2'>
                                    <ValueLabel>{t('proposals.valueForMoney')}</ValueLabel>
                                    <Rating 
                                        filledClassName="fill-primary text-primary" 
                                        rating={proposal.auditability_score}
                                        showValue={false}
                                    />
                                </div>
                                <div className='flex items-center justify-between mb-2'>
                                    <ValueLabel>{t('proposals.feasibility')}</ValueLabel>
                                    <Rating 
                                        filledClassName="fill-primary text-primary" 
                                        rating={proposal.feasibility_score}
                                        showValue={false}
                                    />
                                </div>
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
                        onUserClick={wrappedHandleUserClick}
                        className='bg-content-light'
                        toolTipProps={t('proposals.viewTeam')}
                    />
                </div>

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
