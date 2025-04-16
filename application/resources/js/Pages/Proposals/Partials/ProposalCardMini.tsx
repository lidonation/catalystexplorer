import ProposalCardHeader from '@/Pages/Proposals/Partials/ProposalCardHeader';
import ProposalFundingPercentages from '@/Pages/Proposals/Partials/ProposalFundingPercentages';
import ProposalFundingStatus from '@/Pages/Proposals/Partials/ProposalFundingStatus';
import { useCallback, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Paragraph from '@/Components/atoms/Paragraph';
import Proposal = App.DataTransferObjects.ProposalData;
import Title from '@/Components/atoms/Title';
import IdeascaleProfileUsers from '@/Pages/IdeascaleProfile/Partials/IdeascaleProfileUsersComponent';

interface ProposalCardMiniProps {
    proposal: Proposal;
    isHorizontal: boolean;
}

export default function ProposalCardMini({
    proposal,
    isHorizontal
}: ProposalCardMiniProps) {
    const { t } = useTranslation();
    
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
        [t]
    );
    
    const handleUserMouseLeave = useCallback(() => {
        setHoveredUserName(null);
    }, []);
    
    return (
        <article 
            ref={cardRef}
            className="bg-background z-0 flex h-full flex-col justify-between rounded-xl p-2 shadow-lg relative"
            style={cardHeight && userSelected ? { height: `${cardHeight}px` } : {}}
        >
            {userSelected && (
                <button
                    onClick={noSelectedUser}
                    className="absolute right-4 top-4 z-10 rounded-full p-1 hover:bg-background hover:text-content focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Close profile"
                >
                </button>
            )}
            
            {/* The key change is here - we need to ensure the header section has position relative 
                and a higher z-index so it can overlay content on hover */}
            <section className="flex h-auto w-full flex-col items-start overflow-visible rounded-xl relative">
                <ProposalCardHeader
                    proposal={proposal}
                    userSelected={userSelected}
                    noSelectedUser={noSelectedUser}
                    isHorizontal={isHorizontal}
                />
            </section>
            
            <section ref={contentRef} className="flex-grow flex flex-col">
                {userSelected ? (
                    <>
                        <div className="invisible h-0" aria-hidden="true">
                            <div className="mt-3" aria-labelledby="funding-heading">
                                <div className="flex items-center gap-2">
                                    <Title level='3' className="font-semibold">{t('funding')}</Title>
                                    
                                    <ProposalFundingStatus
                                        funding_status={proposal.funding_status}
                                    />
                                </div>
                                
                                <ProposalFundingPercentages proposal={proposal}/>
                            </div>
                        </div>
                        
                        <div className="mt-3 flex-grow">
                            <div className="p-2">
                                <Title level='4' className="font-medium">
                                    {userSelected.name || t('anonymous')}
                                </Title>
                                {userSelected.bio && (
                                    <Paragraph className="mt-2 text-sm">{userSelected.bio}</Paragraph>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="mt-3" aria-labelledby="funding-heading">
                        <div className="flex items-center gap-2">
                            <Title level='3' className="font-semibold">{t('funding')}</Title>
                            
                            <ProposalFundingStatus
                                funding_status={proposal.funding_status}
                            />
                        </div>
                        
                        <ProposalFundingPercentages proposal={proposal}/>
                    </div>
                )}
                
                <div className="border-t mt-auto border-t-dark/30">
                    {userSelected && (
                        <div className="mt-3">
                        </div>
                    )}
                    
                    {hoveredUserName && (
                        <div className="mt-2 text-sm text-gray-600">
                            {hoveredUserName}
                        </div>
                    )}
                    
                    <IdeascaleProfileUsers
                        users={proposal.users}
                        onUserClick={handleUserClick}
                        onUserMouseEnter={handleUserMouseEnter}
                        onUserMouseLeave={handleUserMouseLeave}
                        className='bg-content-light'
                        toolTipProps={t('proposals.viewTeam')}
                    />
                </div>
            </section>
        </article>
    );
}