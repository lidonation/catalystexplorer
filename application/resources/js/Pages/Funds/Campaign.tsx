import Title from '@/Components/atoms/Title';
import Divider from '@/Components/Divider';
import {PageProps} from '@/types';
import {Head, WhenVisible} from '@inertiajs/react';
import {useTranslation} from 'react-i18next';
import {PaginatedData} from '../../../types/paginated-data';
import CampaignAccordion from '../Campaign/Partials/CampaignAccordion';
import ProposalCardMini from '../Proposals/Partials/ProposalCardMini';
import FundData = App.DataTransferObjects.FundData;
import CampaignData = App.DataTransferObjects.CampaignData;
import ProposalData = App.DataTransferObjects.ProposalData;
import Paginator from "@/Components/Paginator";
import {FiltersProvider} from "@/Context/FiltersContext";
import {SearchParams} from "../../../types/search-params";
import CampaignCardExtended from "@/Pages/Campaign/Partials/CampaignCardExtended";
import ProposalMiniCardLoader from "@/Pages/Proposals/Partials/ProposalMiniCardLoader";
import React from "react";

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

            <div className="flex w-full flex-col gap-y-4 rounded-lg p-4 lg:gap-y-12 lg:p-8 page page-campaign">
                <div className="relative grid grid-cols-9 gap-5">
                    <div className="col-span-9 h-auto lg:col-span-3">
                        <CampaignCardExtended
                            fund={fund}
                            campaign={campaign}
                            className={
                                'lg:sticky lg:top-4'
                            }
                        />
                    </div>
                    <div className="col-span-9 flex flex-col gap-5 lg:col-span-6">
                        <section className="bg-background flex flex-col gap-4 rounded-md px-6 py-4">
                            <div className="flex items-center justify-between">
                                <Title level="3" className="font-bold">
                                    {campaign.title}
                                </Title>
                                <button
                                    className="bg-primary text-primary-light rounded-sm px-2 py-2 text-sm font-semibold">
                                    {t('Submit a Proposal')}
                                </button>
                            </div>

                            <Divider/>

                            {/* accordion */}
                            <article>
                                <CampaignAccordion
                                    title={campaign.excerpt}
                                    content={campaign.content}
                                />
                            </article>
                        </section>

                        <WhenVisible
                            data="proposals"
                            fallback={<ProposalMiniCardLoader />}
                        >
                            <section className="bg-background bg-opacity-5 rounded-md p-4 flex flex-col gap-8">
                                <div>
                                    <Title level="4">
                                        {t('Proposals')}
                                    </Title>

                                    <Divider/>

                                    <ul className="grid w-full auto-rows-fr md:grid-cols-2 2xl:grid-cols-3 gap-2 mt-4">
                                        {proposals?.data &&
                                            proposals?.data.map(
                                                (proposal, index) => (
                                                    <li
                                                        key={index}
                                                        className="h-full rounded-lg border-2 border-border-dark-on-dark"
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

                                <div className="w-full overflow-auto flex flex-col gap-2">
                                    <Divider />

                                    <FiltersProvider defaultFilters={{} as SearchParams}>
                                        {proposals && <Paginator pagination={proposals} linkProps={{only: ['proposals']}}/>}
                                    </FiltersProvider>
                                </div>
                            </section>
                        </WhenVisible>
                    </div>
                </div>
            </div>
        </>
    );
}
