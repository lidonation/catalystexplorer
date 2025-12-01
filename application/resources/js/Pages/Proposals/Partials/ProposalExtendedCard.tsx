import Button from '@/Components/atoms/Button';
import Title from '@/Components/atoms/Title';
import ValueLabel from '@/Components/atoms/ValueLabel';
import Rating from '@/Components/Rating';
import UserQuickView from '@/Components/UserQuickView';
import IdeascaleProfileUsers from '@/Pages/IdeascaleProfile/Partials/ProposalProfilesComponent';
import { useCallback, useEffect, useRef, useState } from 'react';
import ProposalCardFooter from './ProposalCardFooter';
import ProposalCardHeader from './ProposalCardHeader';
import ProposalCardNav from './ProposalCardNav';
import ProposalFundingDetails from './ProposalFundingDetails';
import ProposalFundingStatus from './ProposalFundingStatus';
import ProposalSolution from './ProposalSolution';
import ProposalProblem from './ProposalProblem';
import ProposalProjectStatus from './ProposalProjectStatus';

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

    useEffect(() => {
        if (cardRef.current) {
            const initialHeight = cardRef.current.offsetHeight;
            if (!cardHeight) {
                setCardHeight(initialHeight);
            }
        }
    }, []);

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
            className="bg-background proposal-card proposal-card-vertical relative flex h-full flex-col justify-between gap-3 rounded-xl p-2 shadow-lg"
            style={
                cardHeight && userSelected ? { height: `${cardHeight}px` } : {}
            }
        >
            {userSelected && (
                <Button
                    onClick={wrappedNoSelectedUser}
                    className="hover:bg-background hover:text-content focus:ring-primary absolute top-4 right-4 z-10 rounded-full p-1 focus:ring-2 focus:outline-none"
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

            <section className="flex flex-1 flex-col">
                <div className="flex-1 overflow-auto px-2">
                    {userSelected ? (
                        <UserQuickView user={userSelected} />
                    ) : (
                        <>
                            <section
                                className="mt-3"
                                aria-labelledby="funding-heading"
                            >
                                <div className="my-1.5 flex flex-row items-center justify-between">
                                    <Title
                                        level="5"
                                        className="text-base leading-normal font-medium"
                                    >
                                        {t('ideascaleProfiles.fundingStatus')}
                                    </Title>

                                    <ProposalFundingStatus
                                        funding_status={proposal.funding_status}
                                    />
                                </div>
                                <ProposalFundingDetails proposal={proposal} />
                            </section>

                            <ProposalProjectStatus
                                project_length={proposal.project_length}
                                opensource={proposal.opensource}
                            />
                            {/* Show problem first */}
                            <div className="relative flex h-auto w-full flex-col items-start overflow-visible mb-4">
                                <ProposalProblem
                                    problem={proposal.problem}
                                    slug={proposal.slug}
                                />
                            </div>

                            {/* Show solution below problem */}
                            <div className="relative flex h-auto w-full flex-col items-start overflow-visible">
                                <ProposalSolution
                                    solution={proposal.solution}
                                    slug={proposal.slug}
                                />
                            </div>
                            <div className="border-gray-persist relative mt-2 border-t border-b pt-2 pb-2">
                                <div className="mb-2 flex items-center justify-between">
                                    <ValueLabel>
                                        {t('proposals.impactAlignment')}
                                    </ValueLabel>
                                    <Rating
                                        filledClassName="fill-primary text-primary"
                                        rating={proposal.alignment_score}
                                        showValue={false}
                                    />
                                </div>
                                <div className="mb-2 flex items-center justify-between">
                                    <ValueLabel>
                                        {t('proposals.valueForMoney')}
                                    </ValueLabel>
                                    <Rating
                                        filledClassName="fill-primary text-primary"
                                        rating={proposal.auditability_score}
                                        showValue={false}
                                    />
                                </div>
                                <div className="mb-2 flex items-center justify-between">
                                    <ValueLabel>
                                        {t('proposals.feasibility')}
                                    </ValueLabel>
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
                        className="bg-content-light"
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
