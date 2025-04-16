import type { Tab } from '@/utils/routeTabs';
import TabNavigation from '@/Components/TabNavigation';

interface IdeascaleProfileTabProps {
    tabs: Tab[];
    activeTab: string;
}

export default function IdeascaleProfileTabs({ tabs, activeTab }: IdeascaleProfileTabProps) {    
 
    return (
        <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            centerTabs={true}
        />
    );
}