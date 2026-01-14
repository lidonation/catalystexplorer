import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import { linksEnum } from '@/enums/links-enum';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import ProposalMetadataWidgetSection from './ProposalMetadataWidgetSection';

interface ProjectStatusWidgetProps {
    proposal: App.DataTransferObjects.ProposalData;
}
export default function ProjectStatusWidget({
    proposal,
}: ProjectStatusWidgetProps) {
    const milestones = proposal?.schedule?.milestones ?? [];

    const completedMilestones = milestones.filter(
        (m: App.DataTransferObjects.MilestoneData) =>
            Number(m.completion_percent) === 100,
    ).length;

    const remainingMilestones =
        (proposal?.schedule?.milestone_count ?? 0) - completedMilestones;

    const { t } = useLaravelReactI18n();
    return (
        <Card className="bg-background w-full">
            <Title
                level="4"
                className="border-content/20 border-b pb-5 font-semibold"
            >
                {t('proposals.projectStatus')}
            </Title>{' '}
            <ProposalMetadataWidgetSection
                label={t('proposals.status')}
                value={(() => {
                    const status = proposal?.schedule?.status;

                    if (!status) return '-';

                    const config = {
                        did_not_finished: {
                            label: 'Did Not Finish',
                            className:
                                'bg-error/10 text-error border border-error',
                        },
                        paused: {
                            label: 'Paused',
                            className:
                                'bg-primary/10 text-primary border border-primary',
                        },
                        on_track: {
                            label: 'On Track',
                            className:
                                'bg-primary/10 text-primary border border-primary',
                        },
                        completed: {
                            label: 'Completed',
                            className:
                                'bg-success/10 text-success border border-success',
                        },
                    } as const;

                    const chip = config[status as keyof typeof config];

                    if (!chip) return status;

                    return (
                        <span
                            className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${chip.className}`}
                        >
                            {chip.label}
                        </span>
                    );
                })()}
            />
            <ProposalMetadataWidgetSection
                label={t('proposals.manageProposal.milestonesCompleted')}
                value={completedMilestones}
            />
            <ProposalMetadataWidgetSection
                label={t('proposals.manageProposal.milestonesRemaining')}
                value={remainingMilestones}
            />
            {proposal?.schedule?.milestones && (
                <a
                    href={`${linksEnum.PROPOSAL_MILESTONE_MODULE}${proposal?.schedule?.project_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary mt-5 flex items-center justify-center gap-1 rounded-lg px-3 py-2"
                >
                    <Paragraph className="text-white">
                        {t(
                            'proposals.manageProposal.viewProposalDetailsAndMilestones',
                        )}
                    </Paragraph>
                </a>
            )}
        </Card>
    );
}
