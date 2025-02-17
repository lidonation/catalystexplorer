import React, {ReactNode, useEffect, useState} from 'react';
import UserSection from "@/Pages/My/Components/UserSection";
import UserTab from "@/Pages/My/Components/UserTab";
import {useTranslation} from "react-i18next";
import {usePage} from "@inertiajs/react";
import User = App.DataTransferObjects.UserData;

export default function MyLayout({children}: { children: ReactNode }) {
    const {t} = useTranslation();
    const {auth} = usePage().props;
    const [activeTab, setActiveTab] = useState('Dashboard');

    const tabs = [
        {name: t('my.dashboard'), href: `dashboard`},
        {name: t('my.profile'), href: `profile`},
        {name: t('my.proposals'), href: `proposals`},
        {name: t('my.reviews'), href: `reviews`},
        {name: t('my.groups'), href: `groups`},
        {name: t('my.communities'), href: `communities`},
        {name: t('my.lists'), href: `lists`}
    ];

    useEffect(() => {
        const currentPath = window.location.pathname;
        const lastPathSegment = currentPath.split('/').pop();
        const matchingTab = tabs.find(tab => tab.href.split('/').pop() === lastPathSegment);

        if (matchingTab) {
            setActiveTab(matchingTab.name);
        }
    }, [window.location.pathname]);

    return (
        <div className="min-h-screen bg-background-lighter px-2">
            <header className="bg-background-lighter px-2">
                <div className="px-1 sm:px-6 lg:px-2 py-8 ml-4">
                    <UserSection user={auth?.user as unknown as User}/>

                    <UserTab
                        tabs={tabs}
                        activeTab={activeTab}
                    />
                </div>
            </header>

            <main>
                {children}
            </main>
        </div>
    );
}
