<<<<<<< HEAD
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Link, WhenVisible } from '@inertiajs/react';
import React, { HTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { route } from 'ziggy-js';
import { PaginatedData } from '../../../../types/paginated-data';
=======
import {useLocalizedRoute} from '@/utils/localizedRoute';
import {Link, WhenVisible} from '@inertiajs/react';
import React, {HTMLAttributes} from 'react';
import {useTranslation} from 'react-i18next';
import {route} from 'ziggy-js';
import {PaginatedData} from '../../../../types/paginated-data';
>>>>>>> origin/dev
import ProposalCardMini from './ProposalCardMini';
import ProposalMiniCardLoader from './ProposalMiniCardLoader';
import ProposalData = App.DataTransferObjects.ProposalData;

interface RouteConfig {
<<<<<<< HEAD
    routeName: string;  
=======
    routeName: string;
>>>>>>> origin/dev
    paramKey: string;
    sourceParam: 'groupId' | 'ideascaleProfileId';
}

const ROUTE_MAPPINGS: Record<string, RouteConfig> = {
    'groups': {
<<<<<<< HEAD
        routeName: 'groups.proposals',  // update the route to the screen with all group's proposals
=======
        routeName: 'groups.group.proposals',  // update the route to the screen with all group's proposals
>>>>>>> origin/dev
        paramKey: 'group',
        sourceParam: 'groupId'
    },
    'ideascaleProfiles': {
        routeName: 'ideascaleProfiles.proposals', // update the route to the screen with all ideascale profile's proposals
        paramKey: 'ideascaleProfile',
        sourceParam: 'ideascaleProfileId'
    },
};


interface RelatedProposalsProps extends HTMLAttributes<HTMLDivElement> {
    proposals: PaginatedData<ProposalData[]>;
    groupId?: string;
    ideascaleProfileId?: string;
    maxVisibleProposals?: number;
    proposalWrapperClassName?: string;
}

const RelatedProposals: React.FC<RelatedProposalsProps> = ({
<<<<<<< HEAD
    proposals,
    groupId,
    proposalWrapperClassName,
    ideascaleProfileId,
    ...props
=======
   proposals,
   groupId,
   proposalWrapperClassName,
   ideascaleProfileId,
   ...props
>>>>>>> origin/dev
}) => {
    const {t} = useTranslation();

    const showViewMore = proposals.total > proposals.per_page;

    const getCurrentRouteConfig = () => {
        const currentRoute = route().current();
<<<<<<< HEAD
        
        const baseRoute = currentRoute?.split('.')[1] ?? '';
        
=======

        const baseRoute = currentRoute?.split('.')[1] ?? '';

>>>>>>> origin/dev
        return ROUTE_MAPPINGS[baseRoute] || ROUTE_MAPPINGS['groups'];
    };

    const getRouteParams = (config: RouteConfig) => {
        const paramValue = config.sourceParam === 'groupId' ? groupId : ideascaleProfileId;
<<<<<<< HEAD
        return { [config.paramKey]: paramValue };
=======
        return {[config.paramKey]: paramValue};
>>>>>>> origin/dev
    };

    const routeConfig = getCurrentRouteConfig();

    return (
<<<<<<< HEAD
        <WhenVisible fallback={<ProposalMiniCardLoader />} data="proposals">
            <div {...props}>
                {typeof proposals.data !== 'undefined' &&
                    proposals.data.map((proposal) => (
                        <ProposalCardMini
                            key={proposal.hash}
                            proposal={proposal}
                            isHorizontal={false}
                        />
                    ))}

                {showViewMore && (
                   <Link
                        href={useLocalizedRoute(routeConfig.routeName, getRouteParams(routeConfig))}
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
=======
        <WhenVisible fallback={<ProposalMiniCardLoader/>} data="proposals">
            <div {...props}>
                {typeof proposals.data !== 'undefined' &&
                    proposals.data.map((proposal) => (
                        <div key={proposal.hash} className={proposalWrapperClassName}>
                            <ProposalCardMini
                                proposal={proposal}
                                isHorizontal={false}
                            />
                        </div>
                    ))}

                {showViewMore && (
                    <div className={proposalWrapperClassName}>
                        <Link
                            href={useLocalizedRoute(routeConfig.routeName, getRouteParams(routeConfig))}
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
                    </div>
                        )}
                    </div>
                    </WhenVisible>
                    );
                };
>>>>>>> origin/dev

                export default RelatedProposals;
