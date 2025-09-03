import TabNavigation from '@/Components/TabNavigation';
import type { Tab } from '@/utils/routeTabs';

interface GroupTabProps {
    tabs: Tab[];
    activeTab: string;
}

export default function ProposalTab({ tabs, activeTab }: GroupTabProps) {
    return (
        <TabNavigation tabs={tabs} activeTab={activeTab} centerTabs={true} />
    );
}
