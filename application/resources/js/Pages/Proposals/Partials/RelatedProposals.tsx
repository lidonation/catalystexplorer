import Paragraph from '@/Components/atoms/Paragraph';
import { PaginatedData } from '@/types/paginated-data';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Link, WhenVisible } from '@inertiajs/react';
import React, { HTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import ProposalCardMini from './ProposalCardMini';
import ProposalMiniCardLoader from './ProposalMiniCardLoader';
import ProposalData = App.DataTransferObjects.ProposalData;

interface RouteConfig {
    routeName: string;
    paramKey: string;
    sourceParam: 'groupId' | 'ideascaleProfileId' | 'communityId';
}

const ROUTE_MAPPINGS: Record<string, RouteConfig> = {
    groups: {
        routeName: 'groups.group.proposals', // update the route to the screen with all group's proposals
        paramKey: 'group',
        sourceParam: 'groupId',
    },
    ideascaleProfiles: {
        routeName: 'ideascaleProfiles.proposals', // update the route to the screen with all ideascale profile's proposals
        paramKey: 'ideascaleProfile',
        sourceParam: 'ideascaleProfileId',
    },
    communities: {
        routeName: 'communities.proposals',
        paramKey: 'community',
        sourceParam: 'communityId',
    },
};

interface RelatedProposalsProps extends HTMLAttributes<HTMLDivElement> {
    proposals: PaginatedData<ProposalData[]>;
    routeParam: { [x: string]: string[] | string | null };
    proposalWrapperClassName?: string;
}

const RelatedProposals: React.FC<RelatedProposalsProps> = ({
    proposals,
    routeParam,
    proposalWrapperClassName,
    ...props
}) => {
    const { t } = useTranslation();

    const showViewMore = proposals.total > proposals.per_page;

    return (
        <WhenVisible fallback={<ProposalMiniCardLoader />} data="proposals">
            <div {...props}>
                {typeof proposals.data !== 'undefined' &&
                    proposals.data.map((proposal) => (
                        <div
                            key={proposal.hash}
                            className={proposalWrapperClassName}
                        >
                            <ProposalCardMini
                                proposal={proposal}
                                isHorizontal={false}
                            />
                        </div>
                    ))}

                {showViewMore && (
                    <div className={proposalWrapperClassName}>
                        <Link
                            href={useLocalizedRoute(
                                'proposals.index',
                                routeParam,
                            )}
                            className="bg-background flex h-full flex-col items-center justify-center rounded-xl p-4 shadow-lg transition-transform hover:scale-95"
                        >
                            <div className="flex flex-col items-center gap-4">
                                <div className="text-center">
                                    <Paragraph className="text-sm text-gray-600">
                                        {t('seeAll')}
                                    </Paragraph>
                                    <Paragraph className="text-xl font-semibold">
                                        {proposals.total}
                                    </Paragraph>
                                    <Paragraph className="text-sm text-gray-600">
                                        {t('proposals.proposals')}
                                    </Paragraph>
                                </div>
                            </div>
                        </Link>
                    </div>
                )}
            </div>
        </WhenVisible>
    );
};

export default RelatedProposals;
