import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import Check from '@/Components/svgs/Check';
import { StepDetails } from '@/types';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import {useLaravelReactI18n} from "laravel-react-i18n";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';

interface Step1Props {
    verificationCode: string;
    profile: App.DataTransferObjects.IdeascaleProfileData;
    stepDetails: StepDetails[];
    activeStep: number;
}

const Step2: React.FC<Step1Props> = ({
    verificationCode,
    stepDetails,
    activeStep,
    profile,
}) => {
    const { t } = useLaravelReactI18n();

    const prevStep =
        activeStep === 1
            ? ''
            : generateLocalizedRoute('workflows.claimIdeascaleProfile.index', {
                  step: activeStep - 1,
                   profile: profile.id,
              });

    return (
        <WorkflowLayout
            title="Claim Profile"
            asideInfo={stepDetails[activeStep - 1].info ?? ''}
        >
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="flex h-full w-full flex-col items-center justify-center py-8">
                    <Title
                        level="2"
                        className="text-center text-lg font-semibold"
                    >
                        {t('profileWorkflow.verificationTitle')}
                    </Title>
                    <div className="mt-1 flex justify-center">
                        <Check width={72} height={72} />
                    </div>
                    <div className="mt-4 text-center">
                        <Paragraph>
                            {t('profileWorkflow.verificationCode')}
                        </Paragraph>
                        <Paragraph className="text-primary text-2xl font-bold">
                            CODE$: {verificationCode}
                        </Paragraph>
                    </div>
                </div>
            </Content>

            <Footer>
                <PrimaryLink
                    href={prevStep}
                    className="text-sm lg:px-8"
                    disabled={activeStep == 1}
                    onClick={(e) => activeStep == 1 && e.preventDefault()}
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>{t('Previous')}</span>
                </PrimaryLink>
                <a
                    href="https://cardano.ideascale.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary flex flex-row items-center justify-center gap-3 rounded-lg px-4 text-sm text-white transition lg:px-8 lg:py-3"
                >
                    <span>{t('profileWorkflow.goToIdeascale')}</span>
                    <ChevronRight className="h-4 w-4" />
                </a>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step2;
