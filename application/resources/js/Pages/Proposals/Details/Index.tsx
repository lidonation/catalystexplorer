import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import AIPromptIcon from '@/Components/svgs/AIPromptIcon';
import DurationIcon from '@/Components/svgs/DurationIcon';
import {
    AiSummaryProvider,
    useAiSummaryContext,
} from '@/Context/AiSummaryContext';
import QuickpitchVideoPlayer from '@/Pages/My/Proposals/partials/QuickPitchVideoPlayer';
import { useTrackProposalVisit } from '@/useHooks/useTrackVisit';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import Markdown from 'react-markdown';
import ProposalContent from '../Partials/ProposalContent';
import ProposalLayout from '../ProposalLayout';

interface IndexProps {
    proposal: App.DataTransferObjects.ProposalData;
    globalQuickPitchView: boolean;
    setGlobalQuickPitchView?: (value: boolean) => void;
    userCompleteProposalsCount?: number;
    userOutstandingProposalsCount?: number;
    catalystConnectionsCount?: number;
    userHasProfileInProposal?: boolean;
    isInActiveFund?: boolean;
    quickpitchMetadata?: {
        thumbnail: string;
        views: number;
        likes: number;
        comments: number;
        favoriteCount: number;
        duration?: number;
    } | null;
    ogMeta?: {
        ogImageUrl: string;
        proposalUrl: string;
        description: string;
    };
}

const ProposalDetails = ({
    proposal,
    globalQuickPitchView,
    setGlobalQuickPitchView,
    userHasProfileInProposal = false,
    isInActiveFund = false,
    quickpitchMetadata = null,
    ogMeta,
}: IndexProps) => {
    const { t } = useLaravelReactI18n();
    const { isGenerating, result, error, generateSummary, clearSummary } =
        useAiSummaryContext(); // ✅ now inside the provider

    const manageProposalRoute = useLocalizedRoute('my.proposals.manage', {
        proposal: proposal.id,
    });
    const claimProfileRoute = useLocalizedRoute(
        'workflows.claimCatalystProfile.index',
        { step: 1, proposal: proposal.id },
    );

    const ogImageUrl =
        ogMeta?.ogImageUrl ??
        (typeof window !== 'undefined'
            ? `${window.location.origin}/og-image/proposals/${proposal.slug}`
            : '');
    const proposalUrl =
        ogMeta?.proposalUrl ??
        (typeof window !== 'undefined' ? window.location.href : '');
    const description =
        ogMeta?.description ??
        (proposal.social_excerpt || proposal.excerpt || proposal.title || '');

    const isClaimed = proposal?.is_claimed === true;
    const canCreateQuickPitch =
        !proposal?.quickpitch && userHasProfileInProposal && isInActiveFund;
    const showQuickPitch = !!proposal?.quickpitch;

    const formatDuration = (seconds?: number | string): string => {
        if (seconds === undefined || seconds === null) return '00:00:00';
        const numSeconds =
            typeof seconds === 'string' ? parseInt(seconds, 10) : seconds;
        if (isNaN(numSeconds) || numSeconds < 0) return '00:00:00';
        const hrs = Math.floor(numSeconds / 3600);
        const mins = Math.floor((numSeconds % 3600) / 60);
        const secs = numSeconds % 60;
        return [
            hrs.toString().padStart(2, '0'),
            mins.toString().padStart(2, '0'),
            secs.toString().padStart(2, '0'),
        ].join(':');
    };

    useTrackProposalVisit({
        id: proposal.id,
        title: proposal.title ?? '',
        slug: proposal.slug ?? '',
        fund_label: proposal.fund?.label ?? '',
    });

    const handleGenerateSummary = async () => {
        try {
            await generateSummary(proposal.id);
        } catch (err) {
            console.error('Failed to generate summary:', err);
        }
    };

    const parsedAiSummary = proposal?.ai_summary
        ? typeof proposal.ai_summary === 'string'
            ? JSON.parse(proposal.ai_summary)
            : proposal.ai_summary
        : null;

    return (
        <>
            <Head title={`${proposal.title} - Proposal`}>
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
                {canCreateQuickPitch && (
                    <div className="bg-background shadow-cx-box-shadow mt-4 flex items-center justify-center rounded-xl p-4">
                        <PrimaryLink href={manageProposalRoute}>
                            {t('widgets.quickPitch.add')}
                        </PrimaryLink>
                    </div>
                )}

                {showQuickPitch && (
                    <div className="bg-background shadow-cx-box-shadow mt-4 rounded-xl p-4">
                        <div className="border-gray-persist/80 mb-4 flex w-full items-center justify-between border-b pb-5">
                            <h3 className="text-content text-lg font-semibold">
                                {t('widgets.quickPitch.title')}
                            </h3>
                            {quickpitchMetadata?.duration && (
                                <div className="flex items-center justify-center gap-2">
                                    <span>
                                        <DurationIcon />
                                    </span>
                                    <span className="text-content/50 text-sm">
                                        {formatDuration(
                                            quickpitchMetadata?.duration ??
                                                proposal.quickpitch_length,
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                        <QuickpitchVideoPlayer
                            url={proposal.quickpitch!}
                            thumbnail={quickpitchMetadata?.thumbnail || ''}
                            aspectRatio="aspect-[16/7]"
                        />
                    </div>
                )}

                {!isClaimed && (
                    <div className="bg-background shadow-cx-box-shadow mt-4 flex flex-row items-center justify-center gap-2 rounded-xl p-4">
                        <PrimaryLink href={claimProfileRoute}>
                            {t('workflows.claimCatalystProfile.claim')}
                        </PrimaryLink>
                        {isInActiveFund && (
                            <Paragraph className="text-content/50 mt-2 flex items-center">
                                {t('widgets.quickPitch.disclaimer')}
                            </Paragraph>
                        )}
                    </div>
                )}

                {!proposal?.ai_summary && !result && (
                    <div className="bg-background shadow-cx-box-shadow mt-4 flex flex-row items-center justify-center gap-2 rounded-xl p-4">
                        <PrimaryButton
                            onClick={handleGenerateSummary}
                            disabled={isGenerating}
                        >
                            {isGenerating
                                ? t('proposal.aiSummary.generating')
                                : t('proposal.aiSummary.generate')}
                        </PrimaryButton>
                    </div>
                )}

                {(parsedAiSummary || result) && (
                    <div className="bg-background shadow-cx-box-shadow mt-4 rounded-xl p-6">
                        <div className="border-gray-persist/80 mb-4 flex border-b pb-4 items-center gap-1">
                            <AIPromptIcon width={24} height={24} />
                            <Title className="text-content text-lg font-semibold">
                                {t('proposal.aiSummary.aiSummary')}
                            </Title>
                        </div>

                        {result ? (
                            <>
                                <div className="mb-6">
                                    <Paragraph className="text-content/90 mb-2 text-sm font-semibold">
                                        {t('proposal.aiSummary.summary')}
                                    </Paragraph>
                                    <Markdown>{result.summary}</Markdown>
                                </div>

                                {result.key_points &&
                                    result.key_points.length > 0 && (
                                        <div className="mb-6">
                                            <Paragraph className="text-content/90 mb-2 text-sm font-semibold">
                                                {t(
                                                    'proposal.aiSummary.keyPoints',
                                                )}
                                            </Paragraph>
                                            <ul className="text-content/70 list-outside list-disc space-y-2 pl-6">
                                                {result.key_points.map(
                                                    (point, idx) => (
                                                        <li
                                                            key={idx}
                                                            className="pl-2"
                                                        >
                                                            {point}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                {result.strengths &&
                                    result.strengths.length > 0 && (
                                        <div className="mb-6">
                                            <Paragraph className="text-content/90 mb-2 text-sm font-semibold">
                                                {t(
                                                    'proposal.aiSummary.strengths',
                                                )}
                                            </Paragraph>
                                            <ul className="text-content/70 list-outside list-disc space-y-2 pl-6">
                                                {result.strengths.map(
                                                    (strength, idx) => (
                                                        <li
                                                            key={idx}
                                                            className="pl-2"
                                                        >
                                                            {strength}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                {result.considerations &&
                                    result.considerations.length > 0 && (
                                        <div className="mb-6">
                                            <Paragraph className="text-content/90 mb-2 text-sm font-semibold">
                                                {t(
                                                    'proposal.aiSummary.considerations',
                                                )}
                                            </Paragraph>
                                            <ul className="text-content/70 list-outside list-disc space-y-2 pl-6">
                                                {result.considerations.map(
                                                    (consideration, idx) => (
                                                        <li
                                                            key={idx}
                                                            className="pl-2"
                                                        >
                                                            {consideration}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    )}
                            </>
                        ) : parsedAiSummary ? (
                            <>
                                <div className="mb-6">
                                    <Paragraph className="text-content/90 mb-2 text-sm font-semibold">
                                        {t('proposal.aiSummary.summary')}
                                    </Paragraph>
                                    <Markdown>
                                        {parsedAiSummary.summary}
                                    </Markdown>
                                </div>

                                {parsedAiSummary.key_points &&
                                    parsedAiSummary.key_points.length > 0 && (
                                        <div className="mb-6">
                                            <Paragraph className="text-content/90 mb-2 text-sm font-semibold">
                                                {t(
                                                    'proposal.aiSummary.keyPoints',
                                                )}
                                            </Paragraph>
                                            <ul className="text-content/70 list-outside list-disc space-y-2 pl-6">
                                                {parsedAiSummary.key_points.map(
                                                    (
                                                        point: string,
                                                        idx: number,
                                                    ) => (
                                                        <li
                                                            key={idx}
                                                            className="pl-2"
                                                        >
                                                            {point}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                {parsedAiSummary.strengths &&
                                    parsedAiSummary.strengths.length > 0 && (
                                        <div className="mb-6">
                                            <p className="text-content/90 mb-2 text-sm font-semibold">
                                                {t(
                                                    'proposal.aiSummary.strengths',
                                                )}
                                            </p>
                                            <ul className="text-content/70 list-outside list-disc space-y-2 pl-6">
                                                {parsedAiSummary.strengths.map(
                                                    (
                                                        strength: string,
                                                        idx: number,
                                                    ) => (
                                                        <li
                                                            key={idx}
                                                            className="pl-2"
                                                        >
                                                            {strength}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                {parsedAiSummary.considerations &&
                                    parsedAiSummary.considerations.length >
                                        0 && (
                                        <div className="mb-6">
                                            <Paragraph className="text-content/90 mb-2 text-sm font-semibold">
                                                {t(
                                                    'proposal.aiSummary.considerations',
                                                )}
                                            </Paragraph>
                                            <ul className="text-content/70 list-outside list-disc space-y-2 pl-6">
                                                {parsedAiSummary.considerations.map(
                                                    (
                                                        consideration: string,
                                                        idx: number,
                                                    ) => (
                                                        <li
                                                            key={idx}
                                                            className="pl-2"
                                                        >
                                                            {consideration}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    )}
                            </>
                        ) : null}
                    </div>
                )}

                <ProposalContent proposal={proposal} />
            </ProposalLayout>
        </>
    );
};

const Index = (props: IndexProps) => (
    <AiSummaryProvider>
        <ProposalDetails {...props} />
    </AiSummaryProvider>
);

export default Index;
