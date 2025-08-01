import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import { StepDetails } from '@/types';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { ChevronLeft,ChevronRight } from 'lucide-react';
import React from 'react';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import {useLaravelReactI18n} from "laravel-react-i18n";


interface Step1Props {
    stepDetails: StepDetails[];
    activeStep: number;
}

const Step1: React.FC<Step1Props> = ({ stepDetails, activeStep }) => {
    const nextStep = generateLocalizedRoute('workflows.createVoterList.index', {
        step: activeStep + 1,
    });

    const prevStep = activeStep === 1
    ? ''
    : generateLocalizedRoute('workflows.createVoterList.index', {
        step: activeStep - 1,
    });

    const { t } = useLaravelReactI18n();

    return (
        <WorkflowLayout asideInfo={stepDetails[activeStep - 1].info ?? ''}>
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="bg-background w-full h-full flex flex-col items-center justify-center p-8">
                    <div className="max-w-2xl mb-8">
                        <Paragraph className="mb-4 text-gray-persist">
                            {t('workflows.voterList.welcome')}
                        </Paragraph>
                        <Paragraph className="font-light italic text-gray-persist">
                            {t('workflows.voterList.proposalsOnly')}
                        </Paragraph>
                    </div>
                </div>
            </Content>

            <Footer>
                <PrimaryLink
                    href={prevStep}
                    className="text-sm lg:px-8 lg:py-3"
                    disabled={activeStep == 1}
                    onClick={(e) => activeStep == 1 && e.preventDefault()}
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>{t('Previous')}</span>
                </PrimaryLink>
                <PrimaryLink
                    href={nextStep}
                    className="text-sm lg:px-8 lg:py-3"
                >
                    <span>{t('Next')}</span>
                    <ChevronRight className="h-4 w-4" />
                </PrimaryLink>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step1;
