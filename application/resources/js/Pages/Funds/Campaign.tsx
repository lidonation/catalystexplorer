import Divider from '@/Components/Divider';
import { PageProps } from '@/types';
import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../types/paginated-data';
import CampaignCard from '../Campaign/Partials/CampaignCard';
import ProposalCardMini from '../Proposals/Partials/ProposalCardMini';
import FundData = App.DataTransferObjects.FundData;
import CampaignData = App.DataTransferObjects.CampaignData;
import ProposalData = App.DataTransferObjects.ProposalData;

interface CampaignPageProps extends Record<string, unknown> {
    fund: FundData;
    campaign: CampaignData;
    proposals: PaginatedData<ProposalData[]>;
}

export default function Campaign({
    fund,
    campaign,
    proposals,
}: PageProps<CampaignPageProps>) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={fund.title} />

            <div className="flex w-full flex-col gap-y-4 rounded-lg p-4 lg:gap-y-12 lg:p-8">
                <div className="relative grid grid-cols-9 gap-6">
                    <div className="col-span-9 h-auto lg:col-span-3">
                        <CampaignCard
                            fund={fund}
                            campaign={campaign}
                            className={'bg-background sticky px-4 py-2'}
                        />
                    </div>
                    <div className="col-span-9 flex flex-col gap-4 lg:col-span-6">
                        <div className="bg-background flex flex-col gap-4 rounded-md px-6 py-4">
                            <div className="align-center flex justify-between">
                                <div className="text-content title-5">
                                    {campaign.title}
                                </div>
                                <button className="bg-primary text-primary-light rounded-sm px-4 py-2 font-semibold">
                                    {t('Submit a Proposal')}
                                </button>
                            </div>
                            <Divider />
                            <div className="flex justify-center gap-2">
                                <div className="text-content text-2xl">
                                    {campaign.excerpt}
                                </div>
                                <div className="text-primary boarder-primary title-5 flex h-8 w-12 items-center justify-center rounded-full border border-4 font-bold">
                                    +
                                </div>
                            </div>
                        </div>
                        <WhenVisible
                            data="proposals"
                            fallback={<div>Loading Proposals...</div>}
                        >
                            <div className="bg-background rounded-md p-4">
                                <div className="text-content title-5 px-4 py-2">
                                    {t('Proposals')}
                                </div>
                                <Divider />
                                <ul className="grid w-full auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {proposals?.data &&
                                        proposals?.data.map(
                                            (proposal, index) => (
                                                <li
                                                    key={index}
                                                    className="h-full p-4"
                                                >
                                                    <ProposalCardMini
                                                        proposal={proposal}
                                                        isHorizontal={false}
                                                    />
                                                </li>
                                            ),
                                        )}
                                </ul>
                            </div>
                        </WhenVisible>
                    </div>
                </div>
            </div>
        </>
    );
}
