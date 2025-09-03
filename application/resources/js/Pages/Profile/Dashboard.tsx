// Dashboard.tsx
import { generateTabs, myProfileTabs } from '@/utils/routeTabs';
import { Head, usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useState } from 'react';
import UserSection from './Partials/UserSection';
import UserTab from './Partials/UserTab';
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
    const { t } = useLaravelReactI18n();
    const { auth } = usePage().props;
    const [activeTab, setActiveTab] = useState('');

    const tabs = generateTabs(t, myProfileTabs);

    useEffect(() => {
        const currentPath = window.location.pathname;
        const pathSegments = currentPath.split('/');
        const lastPathSegment = pathSegments[pathSegments.length - 1];

        const matchingTab = tabs.find((tab) => {
            const tabPath = tab.href.split('/').pop();
            return tabPath === lastPathSegment;
        });

        if (matchingTab) {
            setActiveTab(matchingTab.name);
        }
    }, [window.location.pathname, tabs]);

    return (
        <div className="bg-background-lighter min-h-screen">
            <Head title={t('profile.title')} />

            <div className="bg-background-lighter">
                <div className="w-full py-8">
                    <UserSection user={auth?.user as unknown as User} />

                    <UserTab tabs={tabs} activeTab={activeTab} />
                </div>
            </div>

            <div className="w-full py-8">
                <div className="text-content text-center">
                    {t('comingSoon')}
                </div>
            </div>
        </div>
    );
}
