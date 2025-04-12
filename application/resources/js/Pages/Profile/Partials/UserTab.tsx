import { Link } from '@inertiajs/react';
import type { Tab } from '@/utils/routeTabs';
import TabNavigation from '@/Components/TabNavigation';

interface UserTabProps {
    tabs: Tab[];
    activeTab: string;
}

export default function UserTab({ tabs, activeTab }: UserTabProps) {
    return (
        <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            centerTabs={true}
        />
    );
}
