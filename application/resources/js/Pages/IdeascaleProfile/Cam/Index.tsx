import RecordsNotFound from '@/Layouts/RecordsNotFound';
import CampaignList from '@/Pages/Campaign/Partials/CampaignList';
import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import IdeascaleProfileLayout from '../IdeascaleProfileLayout';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import CampaignData = App.DataTransferObjects.CampaignData;
import CampaignCardMini from '@/Pages/Campaign/Partials/CampaignCardMini';
import CampaignLoader from '@/Pages/Campaign/Partials/CampaignLoader';

interface CamPageProps {
    ideascaleProfile: IdeascaleProfileData;
    campaigns: Array<any>;
}

export default function Cam({ ideascaleProfile, campaigns }: CamPageProps) {
    const { t } = useTranslation();

    return (
        <IdeascaleProfileLayout ideascaleProfile={ideascaleProfile}>
            <Head title={`${ideascaleProfile.name} - Cam`} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center">
                    {campaigns ? (
                        <WhenVisible
                            fallback={<CampaignLoader />}
                            data="campaigns"
                        >
                            <CampaignList campaigns={campaigns} className='grid-cols-2'>
                                {(campaign) => (
                                    <CampaignCardMini
                                        key={campaign.hash}
                                        campaign={campaign}
                                        fund={campaign?.fund}
                                    />
                                )}
                            </CampaignList>
                        </WhenVisible>
                    ) : (
                        <RecordsNotFound />
                    )}
                </div>
            </div>
        </IdeascaleProfileLayout>
    );
}
