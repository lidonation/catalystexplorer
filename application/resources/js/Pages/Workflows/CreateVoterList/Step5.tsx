import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import { VerificationBadge } from '@/Components/svgs/VerificationBadge';
import { StepDetails } from '@/types';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import Content from '../Partials/WorkflowContent';
import WorkflowLayout from '../WorkflowLayout';
import RichContent from '@/Components/RichContent';

interface SuccessProps {
    stepDetails: StepDetails[];
    activeStep: number;
    bookmarkHash: string;
}
export default function step5({
    stepDetails,
    activeStep,
    bookmarkHash,
}: SuccessProps) {
    const { t } = useLaravelReactI18n();
    const localizedRoute = useLocalizedRoute;
    const nextStep = localizedRoute('workflows.createVoterList.index', {
        step: activeStep + 1,
        bk: bookmarkHash,
    });
    const browseProposals = localizedRoute('workflows.createVoterList.index', {
        step: 3,
        bk: bookmarkHash,
    });

    return (
        <WorkflowLayout
            title="Create Voter List"
            asideInfo={stepDetails[activeStep - 1]?.info ?? ''}
            disclaimer={t('workflows.voterList.prototype')}
        >
            <Content>
                <div className="bg-background mx-auto flex min-h-[600px] w-full flex-col items-center justify-between rounded-lg p-8 md:w-3/4">
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded p-8 md:w-3/4">
                        <RichContent
                            className="mb-4 text-center"
                            content={t('workflows.voterList.prototype')}
                            format={'html'}
                        />
                        <Title level="4" className="mx-4 text-center font-bold">
                            {t('workflows.voterList.success.title')}
                        </Title>
                        <VerificationBadge size={80} />
                        <Paragraph
                            size="sm"
                            className="text-gray-persist mt-4 text-center"
                        >
                            {t('workflows.bookmarks.bookmarkCreated')}
                        </Paragraph>
                    </div>
                    <div className="flex w-full items-end justify-between gap-4">
                        <PrimaryLink
                            href={browseProposals}
                            className="w-full text-sm lg:px-8 lg:py-3"
                        >
                            <span>
                                {t('workflows.voterList.browseProposal')}
                            </span>
                        </PrimaryLink>
                        <PrimaryLink
                            href={nextStep}
                            className="w-full text-sm lg:px-8 lg:py-3"
                        >
                            <span>{t('workflows.voterList.submitVote')}</span>
                        </PrimaryLink>
                    </div>
                </div>
            </Content>
        </WorkflowLayout>
    );
}
