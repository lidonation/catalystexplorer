import React, {ReactNode, useEffect, useState} from 'react';
import {usePage} from '@inertiajs/react';
import Image from '@/Components/Image';
import Title from '@/Components/atoms/Title';
import GroupSocials from './Partials/GroupSocials';
import GroupHeader from '@/assets/images/group-header.jpg';
import GroupTabs from './Partials/GroupTab';
import {generateTabs, groupTabs} from '@/utils/routeTabs';
import {useTranslation} from 'react-i18next';
import GroupData = App.DataTransferObjects.GroupData;
import {PageProps as InertiaPageProps} from '@inertiajs/core';
import BioCard from '@/Pages/Groups/Partials/BioCard';

interface PageProps extends InertiaPageProps {
    url: string;
    [key: string]: any;
}

interface GroupLayoutProps {
    children: ReactNode;
    group: GroupData;
}

export default function GroupLayout({children, group}: GroupLayoutProps) {
    const {t} = useTranslation();
    const {url} = usePage<PageProps>().props;
    const [activeTab, setActiveTab] = useState('');

    const tabConfig = {
        ...groupTabs,
        routePrefix: `groups/${group.slug}`
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
        <div className="min-h-screen bg-background-lighter">
            <header className="relative">
                <div className="overflow-hidden rounded-lg mx-8 mt-4 sm:mx-10 sm:h-100">
                    <Image
                        imageUrl={group.banner_img_url || GroupHeader}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="container px-4 relative -mt-10">
                    <div className="flex flex-row items-start">
                        <Image
                            imageUrl={group.hero_img_url}
                            className="ml-8 sm:ml-2 md:ml-16 md:-mt-5 size-24 sm:size-28 md:size-32 lg:size-40 border-3 border-darker rounded-full"
                        />
                        <div className="ml-5 pt-12 sm:pt-16 md:pt-20 md:-mt-5">
                            <Title className="text-xl sm:text-2xl font-bold text-content drop-shadow-lg mb-2">
                                {group.name}
                            </Title>
                            <GroupSocials group={group}/>
                        </div>
                    </div>
                </div>
            </header>

            <main className="px-8 sm:px-4 md:px-6 lg:px-8 mt-10 flex flex-col lg:flex-row gap-4">
                <div className="w-full md:w-3/4 lg:w-1/3 xl:w-1/4 mx-auto lg:mx-0 lg:sticky lg:top-4 lg:self-start">
                    <BioCard group={group}/>
                </div>

                <div className="flex flex-col gap-8 w-full lg:w-2/3 xl:w-3/4 shadow-xl bg-background p-4 rounded-lg relative z-0">
                    <section
                        className=" text-content-lighter [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overflow-x-auto relative z-0">
                        <GroupTabs
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
    );
}
