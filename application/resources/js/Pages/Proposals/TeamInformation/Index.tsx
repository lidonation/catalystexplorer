import Graph from '@/Components/Graph';
import { Head, WhenVisible } from '@inertiajs/react';
import ProposalLayout from '../ProposalLayout';
import ConnectionData = App.DataTransferObjects.ConnectionData;
import ProposalData = App.DataTransferObjects.ProposalData;

interface ConnectionPageProps {
    connections: ConnectionData;
    proposal: ProposalData;
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
    globalQuickPitchView,
    setGlobalQuickPitchView,
    ogMeta,
}: ConnectionPageProps) {
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
