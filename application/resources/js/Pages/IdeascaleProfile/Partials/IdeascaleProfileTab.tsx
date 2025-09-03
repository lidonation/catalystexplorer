import TabNavigation from '@/Components/TabNavigation';
import type { Tab } from '@/utils/routeTabs';

interface IdeascaleProfileTabProps {
    tabs: Tab[];
    activeTab: string;
}

export default function IdeascaleProfileTabs({
    tabs,
    activeTab,
}: IdeascaleProfileTabProps) {
    return (
        <TabNavigation tabs={tabs} activeTab={activeTab} centerTabs={true} />
    );
}
