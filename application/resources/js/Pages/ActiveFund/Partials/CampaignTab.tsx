import TabNavigation from '@/Components/TabNavigation';
import type { Tab } from '@/utils/routeTabs';

interface CampaignTabProps {
    tabs: Tab[];
    activeTab: string;
}

export default function CampaignTab({ tabs, activeTab }: CampaignTabProps) {
    return (
        <TabNavigation tabs={tabs} activeTab={activeTab} centerTabs={true} />
    );
}
