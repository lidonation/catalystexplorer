import React, {ReactNode, useEffect, useState} from 'react';
import {usePage} from '@inertiajs/react';
import {generateTabs,  ideascaleProfileTabs} from '@/utils/routeTabs';
import {useTranslation} from 'react-i18next';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import {PageProps as InertiaPageProps} from '@inertiajs/core';
import IdeascaleProfileTabs from './Partials/IdeascaleProfileTab';
import IdeascaleProfileCard from './Partials/IdeascaleProfileCard';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { SearchParams } from '../../../types/search-params';
import { FiltersProvider } from '@/Context/FiltersContext';

interface PageProps extends InertiaPageProps {
    url: string;

    [key: string]: any;
}

interface IdeascaleProfileLayoutProps {
    children: ReactNode;
    ideascaleProfile: IdeascaleProfileData;
    filters?: SearchParams
}

export default function IdeascaleProfileLayout({children, ideascaleProfile, filters}: IdeascaleProfileLayoutProps) {
    const {t} = useTranslation();
    const {url} = usePage<PageProps>().props;
    const [activeTab, setActiveTab] = useState('');

    const tabConfig = {
        ...ideascaleProfileTabs,
        routePrefix: `ideascale-profiles/${ideascaleProfile.hash}`
    };
    const tabs = generateTabs(t, tabConfig);

    useEffect(() => {
        const currentPath = window.location.pathname;

        const matchingTab = tabs.find(tab => {
            const cleanCurrentPath = currentPath.replace(/\/$/, '');
            const cleanTabPath = tab.href.replace(/\/$/, '');

            return cleanCurrentPath.endsWith(cleanTabPath);
        });

        if (matchingTab) {
            setActiveTab(matchingTab.name);
        }
    }, [tabs, url]);

    return (
        <FiltersProvider defaultFilters={filters || {} as SearchParams}>
            <div className="bg-background-lighter">
            <main className="px-8 sm:px-4 md:px-6 lg:px-8 mt-10 flex flex-col lg:flex-row gap-4 h-full ">
                <div className="w-full  lg:w-1/3 xl:w-1/4 mx-auto lg:mx-0 lg:sticky lg:top-4 lg:self-start">
                {ideascaleProfile ? (
                    <IdeascaleProfileCard ideascaleProfile={ideascaleProfile} />
                ) : (
                    <RecordsNotFound context="profiles" />
                )}
                </div>

                <div className="flex flex-col gap-8 w-full lg:w-2/3 xl:w-3/4 shadow-xl bg-background p-4 rounded-lg min-h-full flex-1">
                <section
                    className="text-content-lighter [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overflow-x-auto">
                    <IdeascaleProfileTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    />
                </section>

                <section>
                    {children}
                </section>
                </div>
            </main>
            </div>
        </FiltersProvider>
    );
}
