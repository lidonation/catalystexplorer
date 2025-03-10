// Dashboard.tsx
import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import UserTab from './Partials/UserTab';
import UserSection from './Partials/UserSection';
import { generateTabs, myProfileTabs } from '@/utils/routeTabs';
import User = App.DataTransferObjects.UserData;

interface UserProfileProps {
    dashboard?: any[];
    profile?: any[];
    proposals?: any[];
    reviews?: any[];
    groups?: any[];
    communities?: any[];
    lists?: any[];
}

export default function UserProfile({}: UserProfileProps) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const [activeTab, setActiveTab] = useState('');

    const tabs = generateTabs(t, myProfileTabs);

    useEffect(() => {
        const currentPath = window.location.pathname;
        const pathSegments = currentPath.split('/');
        const lastPathSegment = pathSegments[pathSegments.length - 1];
        
        const matchingTab = tabs.find(tab => {
            const tabPath = tab.href.split('/').pop();
            return tabPath === lastPathSegment;
        });
        
        if (matchingTab) {
            setActiveTab(matchingTab.name);
        }
    }, [window.location.pathname, tabs]);
 
    return (
        <div className="min-h-screen bg-background-lighter px-2">
            <Head title={t('profile.title')} />

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
