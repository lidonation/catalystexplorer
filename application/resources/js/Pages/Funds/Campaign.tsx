import Divider from '@/Components/Divider';
import {PageProps} from '@/types';
import {Head, WhenVisible} from '@inertiajs/react';
import {useTranslation} from 'react-i18next';
import {PaginatedData} from '../../../types/paginated-data';
import CampaignCard from '../Campaign/Partials/CampaignCard';
import ProposalCardMini from '../Proposals/Partials/ProposalCardMini';
import FundData = App.DataTransferObjects.FundData;
import CampaignData = App.DataTransferObjects.CampaignData;
import ProposalData = App.DataTransferObjects.ProposalData;
import Title from "@/Components/atoms/Title";
import Markdown from "marked-react";

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
    const {t} = useTranslation();

    return (
        <>
            <Head title={fund.title}/>

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
                            <div className="items-center flex justify-between">
                                <Title level='1' className="text-content text-lg xl:text-xl">
                                    {campaign.title}
                                </Title>
                                <button
                                    className="bg-primary text-primary-light rounded-sm px-2 py-2 font-semibold text-sm">
                                    {t('Submit a Proposal')}
                                </button>
                            </div>

                            <Divider/>

                            <div className="flex flex-col justify-center gap-2">
                                <div className='flex flex-row flex-nowrap justify-center items-center gap-8'>
                                    <div className='flex flex-1 shrink'>
                                        <Markdown>{campaign.excerpt}</Markdown>
                                    </div>

                                    <div
                                        className="text-primary boarder-primary text-2xl flex size-8 max-w-8 max-h-8 items-center justify-center rounded-full border font-bold">
                                        +
                                    </div>
                                </div>
                                <div>
                                    <Markdown>{campaign.content}</Markdown>
                                </div>
                            </div>
                        </div>
                        <WhenVisible
                            data="proposals"
                            fallback={<div>Loading Proposals...</div>}
                        >
                            <div className="bg-background rounded-md p-4">
                                <Title level='4' className="text-content px-2 py-2">
                                    {t('Proposals')}
                                </Title>
                                <Divider/>
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
