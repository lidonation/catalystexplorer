import Title from '@/Components/atoms/Title';
import Divider from '@/Components/Divider';
import Paginator from '@/Components/Paginator';
import { FiltersProvider } from '@/Context/FiltersContext';
import CampaignCardExtended from '@/Pages/Campaign/Partials/CampaignCardExtended';
import ProposalMiniCardLoader from '@/Pages/Proposals/Partials/ProposalMiniCardLoader';
import { PageProps } from '@/types';
import { Head, WhenVisible } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { PaginatedData } from '../../types/paginated-data';
import { SearchParams } from '../../types/search-params';
import CampaignAccordion from '../Campaign/Partials/CampaignAccordion';
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
    const { t } = useLaravelReactI18n();

    return (
        <>
            <Head title={`Cat: ${fund.title}`} />

            <div className="page page-campaign flex w-full flex-col gap-y-4 rounded-lg p-4 lg:gap-y-12 lg:p-8">
                <div className="relative grid grid-cols-9 gap-5">
                    <div className="col-span-9 h-auto lg:col-span-3">
                        <CampaignCardExtended
                            fund={fund}
                            campaign={campaign}
                            className={'lg:sticky lg:top-4'}
                        />
                    </div>
                    <div className="col-span-9 flex flex-col gap-5 lg:col-span-6">
                        <section className="bg-background flex flex-col gap-4 rounded-md px-6 py-4">
                            <div className="flex items-center justify-between">
                                <Title level="3" className="font-bold">
                                    {campaign.title}
                                </Title>
                                <button className="bg-primary text-primary-light rounded-sm px-2 py-2 text-sm font-semibold">
                                    {t('Submit a Proposal')}
                                </button>
                            </div>

                            <Divider />

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
                            <section className="bg-background bg-opacity-5 flex flex-col gap-8 rounded-md p-4">
                                <div>
                                    <Title level="4">{t('Proposals')}</Title>

                                    <Divider />

                                    <ul className="mt-4 grid w-full auto-rows-fr gap-2 md:grid-cols-2 2xl:grid-cols-3">
                                        {proposals?.data &&
                                            proposals?.data.map(
                                                (proposal, index) => (
                                                    <li
                                                        key={index}
                                                        className="border-border-dark-on-dark h-full rounded-lg border-2"
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

                                <div className="flex w-full flex-col gap-2 overflow-auto">
                                    <Divider />

                                    <FiltersProvider
                                        defaultFilters={{} as SearchParams}
                                    >
                                        {proposals && (
                                            <Paginator
                                                pagination={proposals}
                                                linkProps={{
                                                    only: ['proposals'],
                                                }}
                                            />
                                        )}
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
