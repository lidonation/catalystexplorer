import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import IdeascaleProfileUsers from '@/Pages/IdeascaleProfile/Partials/ProposalProfilesComponent';
import ProposalCardHeader from '@/Pages/Proposals/Partials/ProposalCardHeader';
import ProposalFundingPercentages from '@/Pages/Proposals/Partials/ProposalFundingPercentages';
import ProposalFundingStatus from '@/Pages/Proposals/Partials/ProposalFundingStatus';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useCallback, useEffect, useRef, useState } from 'react';
import Proposal = App.DataTransferObjects.ProposalData;

interface ProposalCardMiniProps {
    proposal: Proposal;
    isHorizontal: boolean;
}

export default function ProposalCardMini({
    proposal,
    isHorizontal,
}: ProposalCardMiniProps) {
    const { t } = useLaravelReactI18n();

    const [userSelected, setUserSelected] =
        useState<App.DataTransferObjects.IdeascaleProfileData | null>(null);

    const [hoveredUserName, setHoveredUserName] = useState<string | null>(null);
    const [cardHeight, setCardHeight] = useState<number | null>(null);
    const cardRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (cardRef.current && !cardHeight) {
            const height = cardRef.current.offsetHeight;
            setCardHeight(height);
        }
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (cardRef.current && !userSelected) {
                setCardHeight(cardRef.current.offsetHeight);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [userSelected]);

    const handleUserClick = useCallback(
        (user: App.DataTransferObjects.IdeascaleProfileData) => {
            if (cardRef.current && !userSelected) {
                setCardHeight(cardRef.current.offsetHeight);
            }
            setUserSelected(user);
        },
        [userSelected],
    );

    const noSelectedUser = useCallback(() => setUserSelected(null), []);

    const handleUserMouseEnter = useCallback(
        (user: App.DataTransferObjects.IdeascaleProfileData) => {
            setHoveredUserName(user.name || t('anonymous'));
        },
        [t],
    );

    const handleUserMouseLeave = useCallback(() => {
        setHoveredUserName(null);
    }, []);

    return (
        <article
            ref={cardRef}
            className="bg-background relative z-0 flex h-full flex-col justify-between rounded-xl p-2 shadow-lg"
            style={
                cardHeight && userSelected ? { height: `${cardHeight}px` } : {}
            }
            data-testid={`proposal-card-mini-${proposal.id}`}
        >
            {userSelected && (
                <button
                    onClick={noSelectedUser}
                    className="hover:bg-background hover:text-content focus:ring-primary absolute top-4 right-4 z-10 rounded-full p-1 focus:ring-2 focus:outline-none"
                    aria-label="Close profile"
                    data-testid="proposal-card-mini-close-button"
                ></button>
            )}

            {/* The key change is here - we need to ensure the header section has position relative
                and a higher z-index so it can overlay content on hover */}
            <section className="relative flex h-auto w-full flex-col items-start overflow-visible rounded-xl">
                <ProposalCardHeader
                    proposal={proposal}
                    userSelected={userSelected}
                    noSelectedUser={noSelectedUser}
                    isHorizontal={isHorizontal}
                />
            </section>

            <section ref={contentRef} className="flex flex-grow flex-col">
                {userSelected ? (
                    <>
                        <div className="invisible h-0" aria-hidden="true">
                            <div
                                className="mt-3"
                                aria-labelledby="funding-heading"
                                data-testid="proposal-card-mini-funding-heading"
                            >
                                <div className="flex items-center gap-2">
                                    <Title level="3" className="font-semibold">
                                        {t('funding')}
                                    </Title>

                                    <ProposalFundingStatus
                                        funding_status={proposal.funding_status}
                                    />
                                </div>

                                <ProposalFundingPercentages
                                    proposal={proposal}
                                />
                            </div>
                        </div>

                        <div className="mt-3 flex-grow">
                            <div className="p-2">
                                <Title level="4" className="font-medium">
                                    {userSelected.name || t('anonymous')}
                                </Title>
                                {userSelected.bio && (
                                    <Paragraph className="mt-2 text-sm">
                                        {userSelected.bio}
                                    </Paragraph>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div
                        className="mt-3"
                        aria-labelledby="funding-heading"
                        data-testid="proposal-card-mini-funding-heading"
                    >
                        <div className="flex items-center gap-2">
                            <Title level="3" className="font-semibold">
                                {t('funding')}
                            </Title>

                            <ProposalFundingStatus
                                funding_status={proposal.funding_status}
                            />
                        </div>

                        <ProposalFundingPercentages proposal={proposal} />
                    </div>
                )}

                <div className="border-t-dark/30 mt-auto border-t">
                    {userSelected && <div className="mt-3"></div>}

                    {hoveredUserName && (
                        <div
                            className="mt-2 text-sm text-gray-600"
                            data-testid="proposal-card-mini-hovered-username"
                        >
                            {hoveredUserName}
                        </div>
                    )}

                    <IdeascaleProfileUsers
                        users={proposal.users}
                        onUserClick={handleUserClick}
                        onUserMouseEnter={handleUserMouseEnter}
                        onUserMouseLeave={handleUserMouseLeave}
                        className="bg-content-light"
                        toolTipProps={t('proposals.viewTeam')}
                    />
                </div>
            </section>
        </article>
    );
}
