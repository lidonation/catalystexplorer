import TabNavigation from '@/Components/TabNavigation';
import type { Tab } from '@/utils/routeTabs';

interface CatalystProfileTabProps {
    tabs: Tab[];
    activeTab: string;
}

export default function CatalystProfileTabs({
    tabs,
    activeTab,
}: CatalystProfileTabProps) {
    return (
        <TabNavigation tabs={tabs} activeTab={activeTab} centerTabs={true} />
    );
}
