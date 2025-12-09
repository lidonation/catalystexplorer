import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import BlueEyeIcon from '@/Components/svgs/BlueEyeIcon';
import IdeascaleLogo from '@/Components/svgs/IdeascaleLogo';
import ProjectCatalystLogo from '@/Components/svgs/ProjectCatalystLogo';
import ThumbsDownIcon from '@/Components/svgs/ThumbsDownIcon';
import ThumbsUpIcon from '@/Components/svgs/ThumbsUpIcon';
import ProposalMetadataWidgetSection from '@/Pages/My/Proposals/partials/ProposalMetadataWidgetSection';
import ProposalFundingStatus from '@/Pages/Proposals/Partials/ProposalFundingStatus';
import { currency } from '@/utils/currency';
import { shortNumber } from '@/utils/shortNumber';
import { Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface ProposalMetadataWidgetProps {
    proposal: App.DataTransferObjects.ProposalData;
}
export default function ProposalMetadataWidget({
    proposal,
}: ProposalMetadataWidgetProps) {
    const { t } = useLaravelReactI18n();
    const totalVotes =
        (proposal?.yes_votes_count ?? 0) +
        (proposal?.no_votes_count ?? 0) +
        (proposal?.abstain_votes_count ?? 0);
    return (
        <Card className="w-full bg-background">
            <Title level="4" className="mb-6 font-semibold">
                {t('proposal.metadata.title')}
            </Title>
            <ProposalMetadataWidgetSection
                label={t('pdf.table.columns.title')}
                value={proposal?.title}
            />
            <ProposalMetadataWidgetSection
                label={t('pdf.table.columns.budget')}
                value={currency(
                    proposal?.amount_requested ?? 0,
                    2,
                    proposal?.currency,
                )}
            />
            <ProposalMetadataWidgetSection
                label={t('pdf.table.columns.fund')}
                value={proposal?.fund?.title ?? '-'}
            />
            <ProposalMetadataWidgetSection
                label={t('pdf.table.columns.category')}
                value={proposal?.campaign?.title ?? '-'}
            />
            <ProposalMetadataWidgetSection
                label={t('pdf.table.columns.status')}
                value={
                    <ProposalFundingStatus
                        funding_status={proposal.funding_status}
                        data-testid="proposal-funding-status-label"
                    />
                }
            />
            <ProposalMetadataWidgetSection
                label={t('proposal.metadata.totalVotes')}
                value={shortNumber(totalVotes, 2) || '0'}
            />
            <ProposalMetadataWidgetSection
                label={t('pdf.table.columns.yesVotes')}
                value={
                    <div className="flex items-center">
                        <ThumbsUpIcon className="text-success mr-1 inline h-4 w-4" />
                        <span>
                            {shortNumber(proposal?.yes_votes_count ?? 0, 2)}
                        </span>
                    </div>
                }
            />
            <ProposalMetadataWidgetSection
                label={t('pdf.table.columns.noVotes')}
                value={
                    <div className="flex items-center gap-1">
                        <ThumbsDownIcon className="mr-1 inline h-4 w-4" />
                        <span>
                            {shortNumber(proposal?.no_votes_count ?? 0, 2)}
                        </span>
                    </div>
                }
            />
            <ProposalMetadataWidgetSection
                label={t('proposal.metadata.links')}
                value={
                    <div className="flex flex-col gap-4">
                        <Link
                            className="bg-primary flex items-center justify-center gap-1 rounded-lg px-3 py-2"
                            href={proposal?.link ?? '#'}
                        >
                            <BlueEyeIcon className="text-white" />
                            <Paragraph className="flex leading-none text-white">
                                {t('proposal.metadata.viewInExplorer')}
                            </Paragraph>
                        </Link>

                        {proposal?.projectcatalyst_io_link && (
                            <a
                                href={proposal?.projectcatalyst_io_link}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Link className="bg-primary flex items-center gap-1 rounded-lg px-3 py-1">
                                    <ProjectCatalystLogo className="text-white" />
                                    <Paragraph className=" text-white">
                                        {t(
                                            'pdf.table.columns.projectCatalystLink',
                                        )}
                                    </Paragraph>
                                </Link>
                            </a>
                        )}
                        {proposal?.ideascale_link && (
                            <a
                                href={proposal?.ideascale_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-primary flex items-center gap-1 rounded-lg px-3 py-2"
                            >
                                <IdeascaleLogo />
                                <Paragraph className=" text-white">
                                    {t('pdf.table.columns.ideascaleLink')}
                                </Paragraph>
                            </a>
                        )}
                    </div>
                }
            />
        </Card>
    );
}
