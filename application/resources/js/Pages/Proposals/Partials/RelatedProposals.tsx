import React, {HTMLAttributes} from 'react';
import { Link, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import ProposalCardMini from './ProposalCardMini';
import ProposalMiniCardLoader from './ProposalMiniCardLoader';

interface RelatedProposalsProps extends HTMLAttributes<HTMLDivElement> {
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
    maxVisibleProposals: maxVisiblePropsProp,
    ...props
}) => {
    const { t } = useTranslation();

    const maxVisibleItems = maxVisiblePropsProp ?? proposals.per_page ?? 12;
    const showViewMore = proposals.total > maxVisibleItems;
    const visibleProposals = proposals.data.slice(0, maxVisibleItems);

    return (
        <WhenVisible
            fallback={<ProposalMiniCardLoader />}
            data="proposals"
        >
            <div {...props}>
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
                        className="bg-background flex h-full flex-col items-center justify-center rounded-xl p-4 shadow-lg transition-transform hover:scale-95"
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
