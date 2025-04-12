import { Link } from '@inertiajs/react';
import type { Tab } from '@/utils/routeTabs';
import TabNavigation from '@/Components/TabNavigation';

interface CommunityTabsProps {
    tabs: Tab[];
    activeTab: string;
}

export default function CommunityTabs({ tabs, activeTab }: CommunityTabsProps) {
    return (
        <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            centerTabs={true}
        />
    );
}
