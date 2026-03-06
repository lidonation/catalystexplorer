import Graph from '@/Components/Graph';
import Title from '@/Components/atoms/Title';
import { Head, WhenVisible } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import ProposalLayout from '../ProposalLayout';
import ConnectionData = App.DataTransferObjects.ConnectionData;
import ProposalData = App.DataTransferObjects.ProposalData;

interface TeamMember {
    id: string;
    name: string | null;
    username?: string | null;
    proposals_count?: number;
    open_proposals_count?: number;
    funded_proposals_count?: number;
    completed_proposals_count?: number;
    proposals_by_fund?: Array<{
        fund_id: string;
        fund_title: string | null;
        fund_label: string | null;
        count: number;
    }>;
}

interface ConnectionPageProps {
    connections: ConnectionData;
    proposal: ProposalData;
    teamWithStats?: TeamMember[];
    globalQuickPitchView: boolean;
    setGlobalQuickPitchView?: (value: boolean) => void;
    ogMeta?: {
        ogImageUrl: string;
        proposalUrl: string;
        description: string;
    };
}

export default function Connections({
    connections,
    proposal,
    teamWithStats,
    globalQuickPitchView,
    setGlobalQuickPitchView,
    ogMeta,
}: ConnectionPageProps) {
    const { t } = useLaravelReactI18n();
    const team = teamWithStats || [];
    // Use server-side OG meta data if available (for SSR)
    const ogImageUrl = ogMeta?.ogImageUrl ?? 
        (typeof window !== 'undefined' ? `${window.location.origin}/og-image/proposals/${proposal.slug}` : '');
    const proposalUrl = ogMeta?.proposalUrl ?? 
        (typeof window !== 'undefined' ? window.location.href : '');
    const description = ogMeta?.description ?? (proposal.social_excerpt || proposal.excerpt || proposal.title || '');

    return (
        <>
            <Head title={`${proposal.title} - Team`}>
                <meta property="og:title" content={proposal.title || ''} />
                <meta property="og:description" content={description} />
                <meta property="og:image" content={ogImageUrl} />
                <meta property="og:url" content={proposalUrl} />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={proposal.title || ''} />
                <meta name="twitter:description" content={description} />
                <meta name="twitter:image" content={ogImageUrl} />
            </Head>
            <ProposalLayout
                proposal={proposal}
                globalQuickPitchView={globalQuickPitchView}
                setGlobalQuickPitchView={setGlobalQuickPitchView}
                ogMeta={ogMeta}
            >
                {team.length > 0 && (
                    <div className="mb-6">
                        <Title level="5" className="text-content mb-4 font-semibold">
                            {t('Team')}
                        </Title>
                        <div className="bg-background-lighter flex flex-nowrap gap-2 overflow-x-auto rounded-xl p-6 shadow-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {team.map((member) => {
                                const currentFund = member.proposals_by_fund?.[0];
                                return (
                                    <div
                                        key={member.id}
                                        className="border-black-persist flex flex-shrink-0 overflow-hidden rounded-xl border-3">
                                        <div className="bg-black-persist flex flex-col justify-content-center px-4 py-3">
                                            <span className="text-3 font-semibold text-content-light">
                                                {member.name || member.username || 'Unknown'}
                                            </span>
                                            <span className="text-4 text-gray-persist">
                                                {t('Metrics')}
                                            </span>
                                        </div>
                                        <div className="bg-background-lighter m-1 flex flex-1 items-center divide-x divide-gray-light rounded-lg">
                                            {currentFund && (
                                                <div className="flex flex-col items-center justify-center px-3 my-2">
                                                    <span className="text-content text-2 font-bold">
                                                        {currentFund.count}
                                                    </span>
                                                    <span className="text-gray-persist text-5">
                                                        {t('In')} {currentFund.fund_label || currentFund.fund_title}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex flex-col items-center justify-center px-3 my-2">
                                                <span className="text-content text-2 font-bold">
                                                    {member.completed_proposals_count ?? 0}
                                                </span>
                                                <span className="text-gray-persist text-5">
                                                    {t('Completed')}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-center justify-center px-3 my-2">
                                                <span className="text-content text-2 font-bold">
                                                    {member.open_proposals_count ?? 0}
                                                </span>
                                                <span className="text-gray-persist text-5">
                                                    {t('Outstanding')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Team Connections Section */}
                <Title level="5" className="text-content mb-4 font-semibold">
                    {t('Team Connections')}
                </Title>

            <WhenVisible
                data="connections"
                fallback={
                    <div className="py-4 text-center">Loading Connections</div>
                }
            >
                <div className="w-full">
                    {typeof connections !== 'undefined' && (
                        <div className="w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            <div className="h-[500px] w-full min-w-[300px] sm:h-[400px] md:h-[500px]">
                                <Graph graphData={connections} />
                            </div>
                        </div>
                    )}
                </div>
            </WhenVisible>
            </ProposalLayout>
        </>
    );
}
