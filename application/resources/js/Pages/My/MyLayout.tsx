// MyLayout.tsx
import { ReactNode, useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import UserSection from './Components/UserSection';
import UserTab from '../Profile/Partials/UserTab';
import { generateTabs, myProfileTabs } from '@/utils/routeTabs';
import { useTranslation } from 'react-i18next';
import User = App.DataTransferObjects.UserData;

interface MyLayoutProps {
    children: ReactNode;
    dashboard?: any[];
    profile?: any[];
    proposals?: any[];
    reviews?: any[];
    groups?: any[];
    communities?: any[];
    lists?: any[];
}

export default function MyLayout({ children }: MyLayoutProps) {
    const { t } = useTranslation();
    const { auth, url } = usePage().props;
    const [activeTab, setActiveTab] = useState('');
    const tabs = generateTabs(t, myProfileTabs);

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
        <div className="min-h-screen bg-background-lighter px-2">
            <div className="bg-background-lighter px-2">
                <div className="px-1 sm:px-6 lg:px-2 py-8 ml-4">
                    <UserSection user={auth?.user as unknown as User} />
                    
                    <UserTab 
                        tabs={tabs}
                        activeTab={activeTab}
                    />
                </div>
            </div>

            {children}
        </div>
    );
}
