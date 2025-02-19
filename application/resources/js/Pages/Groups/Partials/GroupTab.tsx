import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import RelatedProposals from '@/Pages/Proposals/Partials/RelatedProposals';
import Graph from '@/Components/Graph';
import IdeascaleProfileCardMini from '@/Pages/IdeascaleProfile/Partials/IdeascaleProfileCardMini';
import AggregatedReviewsSummary from "@/Components/AggregatedReviewsSummary";
import { Link, WhenVisible } from '@inertiajs/react';
import { generateTabs, TabConfig } from '@/utils/routeTabs';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import ReviewData = App.DataTransferObjects.ReviewData;
import LocationData = App.DataTransferObjects.LocationData;
import ConnectionData = App.DataTransferObjects.ConnectionData;
import GroupData = App.DataTransferObjects.GroupData;
import ProposalData = App.DataTransferObjects.ProposalData;
import { PaginatedData } from '../../../../types/paginated-data';

interface GroupTabProps extends Record<string, unknown> {
    group: GroupData;
    proposals: PaginatedData<ProposalData[]>;
    connections: ConnectionData;
    ideascaleProfiles: PaginatedData<IdeascaleProfileData[]>;
    reviews: PaginatedData<ReviewData[]>;
    locations: PaginatedData<LocationData[]>;
}

const groupTabsConfig: TabConfig = {
    translationPrefix: 'searchResults.tabs',
    routePrefix: 'tab',
    tabs: [
        { key: 'proposals' },
        { key: 'connections' },
        { key: 'ideascaleProfiles' },
        { key: 'reviews' },
        { key: 'locations' }
    ]
};

const GroupTabs: React.FC<GroupTabProps> = ({ proposals, connections, ideascaleProfiles, reviews, locations, group }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('proposals');

    const tabs = generateTabs(t, groupTabsConfig);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'proposals':
                return (
                    <WhenVisible data="proposals" fallback={<div>Loading Proposals...</div>}>
                        <RelatedProposals
                            proposals={proposals}
                            groupId={group.hash ?? undefined}
                            className='proposals-wrapper w-full grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'
                        />
                    </WhenVisible>
                );
            case 'connections':
                return (
                    <section>
                        <WhenVisible data='connections' fallback={<div className="text-center py-4">Loading Connections</div>}>
                            <div className='w-full'>
                                {typeof connections !== 'undefined' && (
                                    <div className='w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overflow-x-auto'>
                                        <div className='min-w-[300px] w-full h-[500px] sm:h-[400px] md:h-[500px]'>
                                            <Graph graphData={connections} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </WhenVisible>
                    </section>
                );
            case 'ideascaleProfiles':
                return (
                    <section>
                        <WhenVisible data='ideascaleProfiles' fallback={<div>Loading Ideascale Profiles</div>}>
                            <div className='w-full overflow-auto'>
                                {typeof ideascaleProfiles?.data !== 'undefined' && (
                                    <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                                        {ideascaleProfiles.data.map((profile) => (
                                            <IdeascaleProfileCardMini
                                                key={profile.hash}
                                                ideascaleProfile={profile}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </WhenVisible>
                    </section>
                );
            case 'reviews':
                return (
                    <section>
                        <WhenVisible data='reviews' fallback={<div>Loading Reviews</div>}>
                            <div className='w-full overflow-auto'>
                                <div>
                                    <AggregatedReviewsSummary reviews={reviews?.data ?? []} />
                                </div>

                                {typeof reviews?.data !== 'undefined' && (
                                    <div className='max-w-full lg:max-w-lg'>
                                        {JSON.stringify(reviews?.data)}
                                    </div>
                                )}
                            </div>
                        </WhenVisible>
                    </section>
                );
            case 'locations':
                return (
                    <section>
                        <WhenVisible data='locations' fallback={<div>Loading Locations</div>}>
                            <div className='w-full overflow-auto'>
                                {typeof locations?.data !== 'undefined' && (
                                    <div className='max-w-full lg:max-w-lg'>
                                        {JSON.stringify(locations?.data)}
                                    </div>
                                )}
                            </div>
                        </WhenVisible>
                    </section>
                );
            default:
                return null;
        }
    };

    return (
        <div>
            <div className="flex border-b border-dark mb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overflow-x-auto">
                {tabs.map((tab) => (
                    <Link
                        key={tab.routeName}
                        href={tab.href}
                        onClick={(e) => {
                            e.preventDefault();
                            setActiveTab(tab.routeName.split('.')[1]);
                        }}
                        className={`py-2 px-4 flex items-center ${
                            activeTab === tab.routeName.split('.')[1]
                                ? '-mb-px border-b-2 border-b-primary text-primary'
                                : ''
                        }`}
                    >
                        {tab.name}
                    </Link>
                ))}
            </div>
            <div>
                {renderTabContent()}
            </div>
        </div>
    );
};

export default GroupTabs;
