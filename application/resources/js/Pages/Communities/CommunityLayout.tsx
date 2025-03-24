import { FiltersProvider } from '@/Context/FiltersContext';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { communityTabs, generateTabs } from '@/utils/routeTabs';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { usePage } from '@inertiajs/react';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchParams } from '../../../types/search-params';
import CommunityTabs from './Partials/CommunityTab';
import CommunityData = App.DataTransferObjects.CommunityData;
import CommunityCard from './Partials/CommunityCard';
import ProposalSummaryCard from './Partials/ProposalSummary';

interface PageProps extends InertiaPageProps {
    url: string;
    [key: string]: any;
}

interface CommunityLayoutProps {
    children: ReactNode;
    community: CommunityData;
    filters?: SearchParams;
}

export default function CommunityLayout({
    children,
    community,
    filters,
}: CommunityLayoutProps) {
    const { t } = useTranslation();
    const { url } = usePage<PageProps>().props;
    const [activeTab, setActiveTab] = useState('');

    const tabConfig = {
        ...communityTabs,
        routePrefix: `communities/${community?.slug}`,
    };
    const tabs = generateTabs(t, tabConfig);

    useEffect(() => {
        const currentPath = window.location.pathname;

        const matchingTab = tabs.find((tab) => {
            const cleanCurrentPath = currentPath.replace(/\/$/, '');
            const cleanTabPath = tab.href.replace(/\/$/, '');

            return cleanCurrentPath.endsWith(cleanTabPath);
        });

        if (matchingTab) {
            setActiveTab(matchingTab.name);
        }
    }, [tabs, url]);


    return (
        <FiltersProvider defaultFilters={filters || ({} as SearchParams)}>
            <div className="bg-background-lighter">
                <main className="mt-10 flex h-full flex-col gap-4 px-8 sm:px-4 md:px-6 lg:flex-row lg:px-8">
                    <div className="mx-auto w-full lg:sticky lg:top-4 lg:mx-0 lg:w-1/3 lg:self-start xl:w-1/3">
                       {
                        community ? (
                            <div className='flex flex-col gap-4'>
                                <CommunityCard community={community}/>
                                <ProposalSummaryCard community={community}/>
                            </div>
                        ) : (
                            <RecordsNotFound context="communities" />
                        )
                       }
                    </div>

                    <div className="bg-background flex min-h-full w-full flex-1 flex-col gap-8 rounded-lg p-4 shadow-xl lg:w-2/3 xl:w-2/3">
                        <section className="text-content-lighter overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            <CommunityTabs tabs={tabs} activeTab={activeTab} />
                        </section>

                        <section>{children}</section>
                    </div>
                </main>
            </div>
        </FiltersProvider>
    );
}
