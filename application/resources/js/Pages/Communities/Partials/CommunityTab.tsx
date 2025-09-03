import TabNavigation from '@/Components/TabNavigation';
import type { Tab } from '@/utils/routeTabs';

interface CommunityTabsProps {
    tabs: Tab[];
    activeTab: string;
}

export default function CommunityTabs({ tabs, activeTab }: CommunityTabsProps) {
    return (
        <TabNavigation tabs={tabs} activeTab={activeTab} centerTabs={true} />
    );
}
