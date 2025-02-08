import { PageProps } from '@/types';
import {Head, WhenVisible} from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import FundData = App.DataTransferObjects.FundData;
import CampaignData = App.DataTransferObjects.CampaignData;
import ProposalData = App.DataTransferObjects.ProposalData;
import {PaginatedData} from "../../../types/paginated-data";

interface CampaignPageProps extends Record<string, unknown> {
    fund: FundData;
    campaign: CampaignData;
    proposals: PaginatedData<ProposalData[]>;
}

export default function Fund({
    fund,
    campaign,
    proposals
}: PageProps<CampaignPageProps>) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={fund.title} />

            <div className="relative flex w-full flex-col justify-center gap-8">
                <section className="container py-8">
                    <h4 className="title-4">{campaign.title}</h4>
                </section>
                <section className="container py-8">
                    <h4 className="title-4">{t('comingSoon')}</h4>
                    <div>{JSON.stringify(campaign)}</div>
                </section>
                <section className='container py-8'>
                    <WhenVisible data='proposals' fallback={<div>Loading Proposals...</div>}>
                        <div>{JSON.stringify(proposals?.data)}</div>
                    </WhenVisible>
                </section>
            </div>
        </>
    );
}
