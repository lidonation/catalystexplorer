import React, {HTMLAttributes} from 'react';
import { Link, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import ProposalCardMini from './ProposalCardMini';
import ProposalMiniCardLoader from './ProposalMiniCardLoader';
import {PaginatedData} from "../../../../types/paginated-data";
import ProposalData = App.DataTransferObjects.ProposalData;

interface RelatedProposalsProps extends HTMLAttributes<HTMLDivElement> {
    proposals: PaginatedData<ProposalData[]>;
    groupId?: string;
    maxVisibleProposals?: number;
}

const RelatedProposals: React.FC<RelatedProposalsProps> = ({
    proposals,
    groupId,
    ...props
}) => {
    const { t } = useTranslation();

    const showViewMore = proposals.total > proposals.per_page;


    return (
        <WhenVisible
            fallback={<ProposalMiniCardLoader />}
            data="proposals"
        >
            <div {...props}>
                {typeof proposals.data !== 'undefined' && (proposals.data.map((proposal) => (
                    <ProposalCardMini
                        key={proposal.hash}
                        proposal={proposal}
                        isHorizontal={false}
                    />
                )))}

                {showViewMore && (
                    <Link
                        href={`/proposals${groupId ? `?g%5B0%5D=${groupId}` : ''}`}
                        className="bg-background flex h-full flex-col items-center justify-center rounded-xl p-4 shadow-lg transition-transform hover:scale-95"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="text-center">
                                <p className="text-sm text-gray-600">{t('seeAll')}</p>
                                <p className="text-xl font-semibold">{proposals.total}</p>
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
