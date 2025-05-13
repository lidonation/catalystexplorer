import type { Tab } from '@/utils/routeTabs';
import TabNavigation from '@/Components/TabNavigation';

interface GroupTabProps {
    tabs: Tab[];
    activeTab: string;
}

export default function ProposalTab({ tabs, activeTab }: GroupTabProps) {
    return (
        <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            centerTabs={true}
        />
    );
}
