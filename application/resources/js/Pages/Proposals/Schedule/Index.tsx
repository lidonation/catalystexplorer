import RecordsNotFound from '@/Layouts/RecordsNotFound.tsx';
import MilestoneAccordion from '@/Pages/IdeascaleProfile/Partials/MilestoneAccordion.tsx';
import { Head, WhenVisible } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import ProposalLayout from '../ProposalLayout';

interface IndexProps {
    proposal: App.DataTransferObjects.ProposalData;
    globalQuickPitchView: boolean;
    setGlobalQuickPitchView?: (value: boolean) => void;
    ogMeta?: {
        ogImageUrl: string;
        proposalUrl: string;
        description: string;
    };
}

const Index = ({
    proposal,
    globalQuickPitchView,
    setGlobalQuickPitchView,
    ogMeta,
}: IndexProps) => {
    const { t } = useLaravelReactI18n();

    // Use server-side OG meta data if available (for SSR)
    const ogImageUrl = ogMeta?.ogImageUrl ?? 
        (typeof window !== 'undefined' ? `${window.location.origin}/og-image/proposals/${proposal.slug}` : '');
    const proposalUrl = ogMeta?.proposalUrl ?? 
        (typeof window !== 'undefined' ? window.location.href : '');
    const description = ogMeta?.description ?? (proposal.social_excerpt || proposal.excerpt || proposal.title || '');

    return (
        <>
            <Head title={`${proposal.title} - Schedule`}>
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
            <div>
                <WhenVisible
                    data="schedule"
                    fallback={
                        <div className="cx-box-shadow bg-background rounded-xl p-16">
                            Loading Schedule Milestones
                        </div>
                    }
                >
                    <section className="bg-background shadow-cx-box-shadow w-full rounded-xl py-4">
                        {proposal?.schedule ? (
                            <>
                                <MilestoneAccordion
                                    milestones={proposal?.schedule.milestones}
                                    totalCost={proposal?.schedule.budget}
                                    currency={proposal?.schedule.currency}
                                    onTrack={
                                        proposal?.schedule?.on_track || false
                                    }
                                />
                            </>
                        ) : (
                            <RecordsNotFound context="projectSchedules" />
                        )}
                    </section>
                </WhenVisible>
            </div>
            </ProposalLayout>
        </>
    );
};

export default Index;
