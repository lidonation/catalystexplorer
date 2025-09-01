import PrimaryLink from '@/Components/atoms/PrimaryLink';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import SuccessComponent from '../Partials/Success';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import Title from '@/Components/atoms/Title';
import { VerificationBadge } from '@/Components/svgs/VerificationBadge';
import Paragraph from '@/Components/atoms/Paragraph';

interface SuccessStepProps {
    stepDetails: any[];
    activeStep: number;
    catalystDrep: string;
}

export default function Success({
    stepDetails,
    activeStep,
    catalystDrep,
}: SuccessStepProps) {
    const localizedRoute = useLocalizedRoute;
    const prevStep = localizedRoute('workflows.drepSignUp.index', {
        step: activeStep - 1,
    });

    const nextStep = localizedRoute('workflows.drepSignUp.index', {
        step: activeStep + 1,
        catalystDrep,
    });

    const { t } = useLaravelReactI18n();

    return (
        <WorkflowLayout
            title="Drep SignUp"
            asideInfo={stepDetails[activeStep - 1]?.info || ''}
        >
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="bg-background mx-auto my-8 flex h-3/4 w-[calc(100%-4rem)] items-center justify-center rounded-lg p-8 md:w-3/4">
                    <div className="flex h-full w-full flex-col items-center justify-center rounded p-8 md:w-3/4 md:shadow-sm">
                        <Title level="4" className="mx-4 text-center font-bold">
                            {t('workflows.catalystDrepSignup.success')}
                        </Title>
                        <VerificationBadge size={80} />
                        <Paragraph
                            size="sm"
                            className="text-gray-persist mt-4 text-center"
                        >
                            {t('workflows.catalystDrepSignup.successStepMsg')}
                        </Paragraph>
                    </div>
                </div>
            </Content>
            <Footer>
                <PrimaryLink
                    href={prevStep}
                    className="text-sm lg:px-8 lg:py-3"
                    onClick={(e) => activeStep == 1 && e.preventDefault()}
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>{t('Previous')}</span>
                </PrimaryLink>
                <PrimaryLink
                    href={nextStep}
                    className="text-sm lg:px-8 lg:py-3"
                >
                    <span>{t('profileWorkflow.next')}</span>
                    <ChevronRight className="h-4 w-4" />
                </PrimaryLink>
            </Footer>
        </WorkflowLayout>
    );
}
