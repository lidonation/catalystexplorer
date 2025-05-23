import PrimaryLink from '@/Components/atoms/PrimaryLink';
import { StepDetails } from '@/types';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SuccessComponent from '../Partials/Success';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import { VerificationBadge } from '@/Components/svgs/VerificationBadge';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';

interface SuccessProps {
    stepDetails: StepDetails[];
    activeStep: number;
    bookmarkCollection: string;
}
export default function Success({
    stepDetails,
    activeStep,
    bookmarkCollection,
}: SuccessProps) {
    const { t } = useTranslation();
    const localizedRoute = useLocalizedRoute;
    const nextStep = localizedRoute('my.lists.index');

    return (
        <WorkflowLayout asideInfo={stepDetails[activeStep - 1]?.info ?? ''}>
            <Content>
                <div className="bg-background mx-auto my-8 flex h-3/4 w-[calc(100%-4rem)] items-center justify-center rounded-lg p-8 md:w-3/4">
                    <div className="flex h-full w-full flex-col items-center justify-center rounded p-8 md:w-3/4 md:shadow-sm gap-3">
                        <Title level="4" className="mx-4 text-center font-bold">
                            {t('workflows.voting.success.title')}
                        </Title>
                        <VerificationBadge size={80} />
                        <Paragraph
                            size="sm"
                            className="text-gray-persist mt-4 text-center"
                        >
                            {t('workflows.bookmarks.bookmarkCreated')}
                        </Paragraph>

                        <PrimaryLink
                            href={nextStep}
                            className="text-sm lg:px-8 lg:py-3 w-full"
                        >
                            <span>{t('workflows.bookmarks.viewList')}</span>
                        </PrimaryLink>
                    </div>
                </div>
            </Content>
        </WorkflowLayout>
    );
}
