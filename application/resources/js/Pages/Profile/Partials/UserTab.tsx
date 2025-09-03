import TabNavigation from '@/Components/TabNavigation';
import type { Tab } from '@/utils/routeTabs';

interface UserTabProps {
    tabs: Tab[];
    activeTab: string;
}

export default function UserTab({ tabs, activeTab }: UserTabProps) {
    return (
        <TabNavigation tabs={tabs} activeTab={activeTab} centerTabs={true} />
    );
}
