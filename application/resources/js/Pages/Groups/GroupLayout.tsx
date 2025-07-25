import Image from '@/Components/Image';
import Title from '@/Components/atoms/Title';
import BioCard from '@/Pages/Groups/Partials/BioCard';
import GroupHeader from '@/assets/images/group-header.jpg';
import { generateTabs, groupTabs } from '@/utils/routeTabs';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import GroupSocials from './Partials/GroupSocials';
import GroupTabs from './Partials/GroupTab';
import GroupData = App.DataTransferObjects.GroupData;

interface PageProps extends InertiaPageProps {
    url: string;
    [key: string]: any;
}

interface GroupLayoutProps {
    children: ReactNode;
    group: GroupData;
}

export default function GroupLayout({ children, group }: GroupLayoutProps) {
    const { t } = useLaravelReactI18n();
    const url = window.location.origin;
    const [activeTab, setActiveTab] = useState('');

    const tabConfig = useMemo(
        () => ({
            ...groupTabs,
            routePrefix: `groups/${group.slug}`,
        }),
        [group.slug],
    );

    const tabs = useMemo(() => generateTabs(t, tabConfig), [t, tabConfig]);


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
    }, [tabs]);

    return (
        <div className="bg-background-lighter min-h-screen">
            <header className="relative">
                <div className="mx-8 mt-4 overflow-hidden rounded-lg sm:mx-10 sm:h-100">
                    <Image
                        imageUrl={group.banner_img_url || GroupHeader}
                        className="h-full w-full object-cover"
                    />
                </div>
                <div className="relative container -mt-10 px-4">
                    <div className="flex flex-row items-start">
                        <Image
                            imageUrl={group.hero_img_url}
                            className="border-darker ml-8 size-24 rounded-full border-3 sm:ml-2 sm:size-28 md:-mt-5 md:ml-16 md:size-32 lg:size-40"
                        />
                        <div className="ml-5 pt-12 sm:pt-16 md:-mt-5 md:pt-20">
                            <Title className="text-content mb-2 text-xl font-bold drop-shadow-lg sm:text-2xl">
                                {group.name}
                            </Title>
                            <GroupSocials group={group} />
                        </div>
                    </div>
                </div>
            </header>

            <main className="mt-10 flex flex-col gap-4 px-8 sm:px-4 md:px-6 lg:flex-row lg:px-8">
                <div className="mx-auto w-full md:w-3/4 lg:sticky lg:top-4 lg:mx-0 lg:w-1/3 lg:self-start xl:w-1/4">
                    <BioCard group={group} />
                </div>

                <div className="bg-background relative z-0 flex w-full flex-col gap-8 rounded-lg p-4 shadow-xl lg:w-2/3 xl:w-3/4">
                    <section className="text-content-lighter relative z-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <GroupTabs tabs={tabs} activeTab={activeTab} />
                    </section>

                    <section>{children}</section>
                </div>
            </main>
        </div>
    );
}
