import React from 'react';
import { Link, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import ProposalCardMini from './ProposalCardMini';
import ProposalMiniCardLoader from './ProposalMiniCardLoader';

interface RelatedProposalsProps {
    proposals: {
        data: Array<App.DataTransferObjects.ProposalData>;
        total: number;
        per_page?: number;
    };
    groupId?: number;
    maxVisibleProposals?: number;
}

const RelatedProposals: React.FC<RelatedProposalsProps> = ({ 
    proposals, 
    groupId,
    maxVisibleProposals: maxVisiblePropsProp 
}) => {
    const { t } = useTranslation();
    
    const maxVisibleItems = maxVisiblePropsProp ?? proposals.per_page ?? 12;
    const showViewMore = proposals.total > maxVisibleItems;
    const visibleProposals = proposals.data.slice(0, showViewMore ? maxVisibleItems - 1 : maxVisibleItems);

    return (
        <WhenVisible
            fallback={<ProposalMiniCardLoader />}
            data="proposals"
        >
            <div className="proposals-wrapper mt-4 grid w-full grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {visibleProposals.map((proposal) => (
                    <ProposalCardMini
                        key={proposal.id}
                        proposal={proposal}
                        isHorizontal={false}
                    />
                ))}

                {showViewMore && (
                    <Link
                        href={`/proposals${groupId ? `?g%5B0%5D=${groupId}` : ''}`}
                        className="bg-background min-h-96 flex h-full flex-col items-center justify-center rounded-xl p-4 shadow-lg transition-transform hover:scale-95"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="text-center">
                                <p className="text-sm text-gray-600">{t('seeAll')}</p>
                                <p className="text-xl font-semibold">{proposals.total - (maxVisibleItems - 1)}</p>
                                <p className="text-sm text-gray-600">{t('proposals.proposals')}</p>
                            </div>
                        </div>
                    </Link>
                )}
            </div>
        </WhenVisible>
    );
};

export default RelatedProposals;
