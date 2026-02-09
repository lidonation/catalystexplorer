import Graph from '@/Components/Graph';
import { Head, WhenVisible } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import ProposalLayout from '../ProposalLayout';
import ConnectionData = App.DataTransferObjects.ConnectionData;
import ProposalData = App.DataTransferObjects.ProposalData;

interface TeamStats {
    totalProposals: number;
    completedProposals: number;
    outstandingProposals: number;
    fundedProposals: number;
}

interface ConnectionPageProps {
    connections: ConnectionData;
    proposal: ProposalData;
    globalQuickPitchView: boolean;
    setGlobalQuickPitchView?: (value: boolean) => void;
    teamStats?: TeamStats;
    ogMeta?: {
        ogImageUrl: string;
        proposalUrl: string;
        description: string;
    };
}

export default function Connections({
    connections,
    proposal,
    globalQuickPitchView,
    setGlobalQuickPitchView,
    teamStats,
    ogMeta,
}: ConnectionPageProps) {
    const { t } = useLaravelReactI18n();

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

            {/* Team Statistics */}
            <div className="bg-background shadow-cx-box-shadow flex flex-col items-start justify-between gap-5 self-stretch overflow-x-auto rounded-xl p-4 sm:flex-row sm:gap-2 sm:p-6">
                <div className="flex w-120 items-center justify-start gap-4 overflow-x-auto">
                    <div className="inline-flex flex-1 flex-col items-start justify-start gap-1">
                        <div className="text-gray-persist text-sm">
                            {t('proposals.totalProposals')}
                        </div>
                        <div className="text-content text-base">
                            {teamStats?.totalProposals && teamStats.totalProposals > 0
                                ? teamStats.totalProposals
                                : '-'}
                        </div>
                    </div>
                    <div className="inline-flex flex-1 flex-col items-start justify-start gap-1">
                        <div className="text-gray-persist text-sm">
                            {t('proposals.outstanding')}
                        </div>
                        <div className="text-content text-base">
                            {teamStats?.outstandingProposals && teamStats.outstandingProposals > 0
                                ? teamStats.outstandingProposals
                                : '-'}
                        </div>
                    </div>
                    <div className="inline-flex flex-1 flex-col items-start justify-start gap-1">
                        <div className="text-gray-persist text-sm">
                            {t('proposals.completed')}
                        </div>
                        <div className="text-content text-base">
                            {teamStats?.completedProposals && teamStats.completedProposals > 0
                                ? teamStats.completedProposals
                                : '-'}
                        </div>
                    </div>
                    <div className="inline-flex flex-1 flex-col items-start justify-start gap-1">
                        <div className="text-gray-persist text-sm">
                            {t('proposals.funded')}
                        </div>
                        <div className="text-content text-base">
                            {teamStats?.fundedProposals && teamStats.fundedProposals > 0
                                ? teamStats.fundedProposals
                                : '-'}
                        </div>
                    </div>
                </div>
            </div>

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
