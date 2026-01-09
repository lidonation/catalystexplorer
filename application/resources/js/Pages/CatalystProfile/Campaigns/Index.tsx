import RecordsNotFound from '@/Layouts/RecordsNotFound';
import CampaignCardMini from '@/Pages/Campaign/Partials/CampaignCardMini';
import CampaignList from '@/Pages/Campaign/Partials/CampaignList';
import CampaignLoader from '@/Pages/Campaign/Partials/CampaignLoader';
import { Head, WhenVisible } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import CatalystProfileLayout from '../CatalystProfileLayout';
import CatalystProfileData = App.DataTransferObjects.CatalystProfileData;
import CampaignData = App.DataTransferObjects.CampaignData;

interface CamPageProps {
    catalystProfile: CatalystProfileData;
    campaigns: CampaignData[];
}

export default function Campaigns({
    catalystProfile,
    campaigns,
}: CamPageProps) {
    const { t } = useLaravelReactI18n();

    return (
        <CatalystProfileLayout catalystProfile={catalystProfile}>
            <Head title={`${catalystProfile.name} - Campaigns`} />

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
                                        key={campaign.id}
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
        </CatalystProfileLayout>
    );
}
