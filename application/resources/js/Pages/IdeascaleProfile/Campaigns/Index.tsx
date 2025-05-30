import RecordsNotFound from '@/Layouts/RecordsNotFound';
import CampaignCardMini from '@/Pages/Campaign/Partials/CampaignCardMini';
import CampaignList from '@/Pages/Campaign/Partials/CampaignList';
import CampaignLoader from '@/Pages/Campaign/Partials/CampaignLoader';
import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import IdeascaleProfileLayout from '../IdeascaleProfileLayout';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import CampaignData = App.DataTransferObjects.CampaignData;

interface CamPageProps {
    ideascaleProfile: IdeascaleProfileData;
    campaigns: CampaignData[];
}

export default function Campaigns({
    ideascaleProfile,
    campaigns,
}: CamPageProps) {
    const { t } = useTranslation();

    return (
        <IdeascaleProfileLayout ideascaleProfile={ideascaleProfile}>
            <Head title={`${ideascaleProfile.name} - Campaigns`} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center">
                    <WhenVisible fallback={<CampaignLoader />} data="campaigns">
                        {campaigns && campaigns.length ? (
                            <CampaignList
                                campaigns={campaigns}
                                className="grid-cols-2 gap-4"
                            >
                                {(campaign) => (
                                    <CampaignCardMini
                                        key={campaign.hash}
                                        campaign={campaign}
                                        fund={campaign?.fund}
                                    />
                                )}
                            </CampaignList>
                        ) : (
                            <RecordsNotFound />
                        )}
                    </WhenVisible>
                </div>
            </div>
        </IdeascaleProfileLayout>
    );
}
