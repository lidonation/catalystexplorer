import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import QuickpitchVideoPlayer from '@/Pages/My/Proposals/partials/QuickPitchVideoPlayer';
import { currency } from '@/utils/currency';
import { Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface QuickPitchCardProps {
    proposal: App.DataTransferObjects.ProposalData;
    thumbnail: string;
    type?: 'featured' | 'regular';
    feature?: boolean;
    aspectRatio?: string;
}

export default function QuickPitchCard({
   proposal,
   feature = false,
   aspectRatio = 'aspect-[16/9]'
}: QuickPitchCardProps) {
    const { t } = useLaravelReactI18n();
    const getProgressBarColor = (percentage: number): string => {
        if (percentage >= 80) return 'bg-success';
        if (percentage >= 50) return 'bg-accent-secondary';
        return 'bg-primary';
    };

    const fundingPercentage =
        Math.ceil(
            ((proposal?.amount_received ?? 0) /
                (proposal?.amount_requested ?? 0)) *
            100
        ) || 0;
    const progressBarColor = getProgressBarColor(fundingPercentage);

    return (
        <div className={feature ? 'col-span-1 md:col-span-2' : 'col-span-1'}>
            <Card className={`flex h-full rounded-2xl  ${feature ? 'flex-row justify-start gap-3 w-full bg-slate-200/50' : 'flex-col bg-background'}`}>
                <div className={`flex flex-shrink-0 rounded-2xl ${feature ? 'w-3/5' : ''}`}>
                    <QuickpitchVideoPlayer
                        url={proposal.quickpitch ?? null}
                        aspectRatio={aspectRatio}
                        thumbnail={proposal?.quickpitch_thumbnail ?? ''}
                    />
                </div>

                <div className={`flex flex-shrink-0 rounded-2xl flex-grow flex-col ${feature ? 'w-2/5 px-2 py-4' : 'justify-end mt-2'}` }>
                    <div className={`flex flex-col justify-end ${feature ? 'gap-3' : ''}`}>
                        <Link
                            href={proposal.link ?? '#'}
                            className="hover:text-primary w-full font-medium"
                            data-testid={`quickpitch-card-link-${proposal.id}`}
                            style={{ overflow: 'visible' }}
                        >
                            <Title
                                level="4"
                                data-testid={`proposal-card-title-${proposal.id}`}
                                className="line-clamp-2 flex min-h-[3.5rem] items-start"
                            >
                                {proposal.title}
                            </Title>
                        </Link>

                        <div className={`flex justify-between ${feature ? 'flex-col gap-3 mt-2' : 'flex-row mt-4'}`}>
                            <div className={`flex ${feature ? 'flex-row gap-3 justify-between' : 'flex-col'}`}>
                                <Paragraph size="sm" className="text-content/60">
                                    {t('proposals.outstanding')}
                                </Paragraph>
                                <Paragraph>{proposal.outstanding_proposals_count ? proposal.outstanding_proposals_count : '-'}</Paragraph>
                            </div>
                            <div className={`flex ${feature ? 'flex-row gap-3 justify-between' : 'flex-col'}`}>
                                <Paragraph size="sm" className="text-content/60">
                                    {t('proposals.completed')}
                                </Paragraph>
                                <Paragraph>{proposal.completed_proposals_count ? proposal.completed_proposals_count :  '-'}</Paragraph>
                            </div>
                            <div className={`flex ${feature ? 'flex-row gap-3 justify-between' : 'flex-col'}`}>
                                <Paragraph size="sm" className="text-content/60">
                                    {t('proposals.catalystConnection')}
                                </Paragraph>
                                <Paragraph>{proposal.connections_count ? proposal.connections_count : '-'}</Paragraph>
                            </div>
                        </div>

                        <div className={`${feature ? 'mt-10' : 'mt-1'}`}>
                            <div
                                className="flex items-baseline justify-between gap-2"
                                data-testid="proposal-funding-received"
                            >
                                <span className="text-content/60">
                                    {t('proposals.filters.budget')}
                                </span>
                                <div>
                                    <span className="text-md font-semibold">
                                        {currency(
                                            proposal?.amount_requested ?? 0,
                                            2,
                                            proposal?.currency
                                        )}
                                    </span>
                                    {/*<span*/}
                                    {/*    className="text-highlight text-sm">*/}
                                    {/*    {` / ${currency(proposal?.amount_requested ?? 0, 2, proposal?.currency ?? 'USD')} (${fundingPercentage}%)`}*/}
                                    {/*</span>*/}
                                </div>
                            </div>
                            {/*<div*/}
                            {/*    className="flex items-baseline justify-between gap-2 pt-2"*/}
                            {/*    data-testid="proposal-funding-requested"*/}
                            {/*>*/}
                            {/*    <div*/}
                            {/*        className="bg-content-light mt-2 h-3 w-full overflow-hidden rounded-full"*/}
                            {/*        data-testid="proposal-funding-progress-bar"*/}
                            {/*    >*/}
                            {/*        <div*/}
                            {/*            className={`h-full rounded-full ${progressBarColor}`}*/}
                            {/*            role="progressbar"*/}
                            {/*            aria-label="funds recieved"*/}
                            {/*            aria-valuenow={fundingPercentage}*/}
                            {/*            aria-valuemin={0}*/}
                            {/*            aria-valuemax={100}*/}
                            {/*            style={{ width: `${fundingPercentage}%` }}*/}
                            {/*        ></div>*/}
                            {/*    </div>*/}
                            {/*</div>*/}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
