import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import UserTab from './Partials/UserTab';
import UserSection from './Partials/UserSection';
import User = App.DataTransferObjects.UserData;

interface UserProfileProps {
    dashboard?: any[];
    profile?: any[];
    proposals?: any[];
    reviews?: any[];
    groups?: any[];
    communities?: any[];
    list?: any[];
}

export default function UserProfile({}: UserProfileProps) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const [activeTab, setActiveTab] = useState('Dashboard');

    const tabs = [
        { name: t('my.dashboard'), href: `dashboard` },
        { name: t('my.profile'), href: `profile` },
        { name: t('my.proposals'), href: `proposals` },
        { name: t('my.reviews'), href: `reviews` },
        { name: t('my.groups'), href: `groups` },
        { name: t('my.communities'), href: `communities` },
        { name: t('my.lists'), href: `list` }
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
            <Head title="Profile" />

            <div className="bg-background-lighter px-2">
                <div className="px-1 sm:px-6 lg:px-2 py-8 ml-4">
                    <UserSection user={auth?.user as unknown as User} />
                    
                    <UserTab 
                        tabs={tabs}
                        activeTab={activeTab}
                    />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center text-content">
                    {t('comingSoon')}
                </div>
            </div>
        </div>
    );
}
