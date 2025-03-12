import ProposalCardHeader from '@/Pages/Proposals/Partials/ProposalCardHeader';
import ProposalFundingPercentages from '@/Pages/Proposals/Partials/ProposalFundingPercentages';
import ProposalFundingStatus from '@/Pages/Proposals/Partials/ProposalFundingStatus';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    
    const handleUserClick = useCallback(
        (user: App.DataTransferObjects.IdeascaleProfileData) =>
            setUserSelected(user),
        [],
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
        <article className="bg-background z-0 flex h-full flex-col justify-between rounded-xl p-2 shadow-lg relative">
            {userSelected && (
                <button
                    onClick={noSelectedUser}
                    className="absolute right-4 top-4 z-10 rounded-full p-1 text-context hover:bg-background hover:text-context focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Close profile"
                >
                </button>
            )}
            
            <section className="flex h-auto w-full flex-col items-start overflow-hidden rounded-xl">
                <ProposalCardHeader
                    proposal={proposal}
                    userSelected={userSelected}
                    noSelectedUser={noSelectedUser}
                    isHorizontal={isHorizontal}
                />
            </section>
            
            <section>
                <div className="mt-3" aria-labelledby="funding-heading">
                    <div className="flex items-center gap-2">
                        <Title level='3' className="font-semibold">{t('funding')}</Title>
                        
                        <ProposalFundingStatus
                            funding_status={proposal.funding_status}
                        />
                    </div>
                    
                    <ProposalFundingPercentages proposal={proposal}/>
                </div>
                
                <div className="border-t mt-3 border-t-dark/30">
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