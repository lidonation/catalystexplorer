// MyLayout.tsx
import { FiltersProvider } from '@/Context/FiltersContext';
import { SearchParams } from '@/types/search-params';
import { generateTabs, myProfileTabs } from '@/utils/routeTabs';
import { usePage } from '@inertiajs/react';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import UserTab from '../Profile/Partials/UserTab';
import UserSection from './Components/UserSection';
import User = App.DataTransferObjects.UserData;

interface MyLayoutProps {
    children: ReactNode;
    filters?: SearchParams;
    dashboard?: any[];
    profile?: any[];
    proposals?: any[];
    reviews?: any[];
    groups?: any[];
    communities?: any[];
    lists?: any[];
}

export default function MyLayout({ children, filters }: MyLayoutProps) {
    const { t } = useTranslation();
    const { auth, url } = usePage().props;
    const [activeTab, setActiveTab] = useState('');
    const tabs = generateTabs(t, myProfileTabs);

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
            <div className="bg-background-lighter min-h-screen px-2">
                <div className="bg-background-lighter px-2">
                    <div className="ml-4 px-1 py-8 sm:px-6 lg:px-2">
                        <UserSection user={auth?.user as User} />

                        <UserTab tabs={tabs} activeTab={activeTab} />
                    </div>
                </div>

                {children}
            </div>
        </FiltersProvider>
    );
}
