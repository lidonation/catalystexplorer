import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { SearchParams } from '@/types/search-params';
import { generateTabs, proposalProfileTabs } from '@/utils/routeTabs';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ReactNode, useEffect, useState } from 'react';
import CatalystProfileCard from './Partials/CatalystProfileCard';
import CatalystProfileTabs from './Partials/CatalystProfileTab';
import CatalystProfileData = App.DataTransferObjects.CatalystProfileData;

interface PageProps extends InertiaPageProps {
    url: string;

    [key: string]: any;
}

interface CatalystProfileLayoutProps {
    children: ReactNode;
    catalystProfile: CatalystProfileData;
    filters?: SearchParams;
}

export default function CatalystProfileLayout({
    children,
    catalystProfile,
    filters,
}: CatalystProfileLayoutProps) {
    const { t } = useLaravelReactI18n();
    const { url } = usePage<PageProps>().props;
    const [activeTab, setActiveTab] = useState('');

    const tabConfig = {
        ...proposalProfileTabs,
        routePrefix: `catalyst.profiles/${catalystProfile.id}`,
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
        <div className="bg-background-lighter mb-8">
            <main className="mt-10 flex h-full flex-col gap-4 px-8 sm:px-4 md:px-6 lg:flex-row lg:px-8">
                <div className="mx-auto w-full lg:sticky lg:top-4 lg:mx-0 lg:w-1/3 lg:self-start xl:w-1/4">
                    {catalystProfile ? (
                        <CatalystProfileCard
                            catalystProfile={catalystProfile}
                        />
                    ) : (
                        <RecordsNotFound context="profiles" />
                    )}
                </div>

                <div className="bg-background flex min-h-full w-full flex-1 flex-col gap-8 rounded-lg p-4 shadow-xl lg:w-2/3 xl:w-3/4">
                    <section className="text-content-lighter overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <CatalystProfileTabs
                            tabs={tabs}
                            activeTab={activeTab}
                        />
                    </section>

                    <section>{children}</section>
                </div>
            </main>
        </div>
    );
}
