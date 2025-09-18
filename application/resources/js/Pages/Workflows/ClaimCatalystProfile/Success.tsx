import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import { VerificationBadge } from '@/Components/svgs/VerificationBadge';
import { StepDetails } from '@/types';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import Content from '../Partials/WorkflowContent';
import WorkflowLayout from '../WorkflowLayout';

interface SuccessProps {
    stepDetails: StepDetails[];
    activeStep: number;
}
export default function Success({
    stepDetails,
    activeStep,
}: SuccessProps) {
    const { t } = useLaravelReactI18n();
    const localizedRoute = useLocalizedRoute;
    const nextStep = localizedRoute('my.profile');

    return (
        <WorkflowLayout
            title="Create Bookmark"
            asideInfo={stepDetails[activeStep - 1]?.info ?? ''}
        >
            <Content>
                <div className="bg-background mx-auto my-8 flex h-3/4 w-[calc(100%-4rem)] items-center justify-center rounded-lg p-8 md:w-3/4">
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded p-8 md:w-3/4 md:shadow-sm">
                        <Title level="4" className="mx-4 text-center font-bold">
                            {t('workflows.bookmarks.success.title')}
                        </Title>
                        <VerificationBadge size={80} />
                        <Paragraph
                            size="sm"
                            className="text-gray-persist mt-4 text-center"
                        >
                            {t('workflows.claimCatalystProfile.successConfirmation')}
                        </Paragraph>

                        <PrimaryLink
                            href={nextStep}
                            className="w-full text-sm lg:px-8 lg:py-3"
                        >
                            <span>{t('workflows.claimCatalystProfile.viewProfile')}</span>
                        </PrimaryLink>
                    </div>
                </div>
            </Content>
        </WorkflowLayout>
    );
}
