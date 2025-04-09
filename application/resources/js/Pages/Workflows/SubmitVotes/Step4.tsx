import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';
import { router, useForm } from '@inertiajs/react';
import { generateLocalizedRoute, useLocalizedRoute } from '@/utils/localizedRoute';

import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import WorkflowLayout from '../WorkflowLayout';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';

import { StepDetails } from '@/types';
import {VerificationBadge} from "@/Components/svgs/VerificationBadge";
import {SubmitIcon} from "@/Components/svgs/SubmitIcon";

interface Step4Props {
    stepDetails: StepDetails[];
    activeStep: number;
}

const Step4: React.FC<Step4Props> = ({
                                         stepDetails,
                                         activeStep
                                     }) => {
    const { t } = useTranslation();
    const localizedRoute = useLocalizedRoute;
    const prevStep = localizedRoute('workflows.voting.index', { step: activeStep - 1 });
    const successRoute = generateLocalizedRoute('workflows.voting.index', { step: activeStep - 1 });

    const form = useForm({});

    const submitVotes = () => {
        form.post(generateLocalizedRoute('workflows.submitVotes.submit'), {
            onSuccess: () => {
                router.visit(successRoute);
            }
        });
    };

    return (
        <WorkflowLayout asideInfo={stepDetails[activeStep - 1]?.info || ''}>
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="max-w-3xl mx-auto w-full">
                    <div className="bg-white p-6 flex flex-col items-center justify-center">
                        <Title level="4" className="mb-6 text-center">{t('workflows.voting.steps.readyToVote')} </Title>
                        <SubmitIcon size={100} />
                        <Paragraph className="text-center italic text-gray-persist">
                            {t('workflows.voting.steps.submitReviewedVotes')}
                        </Paragraph>

                        <PrimaryButton
                            className="px-8 py-3 w-full max-w-md"
                            onClick={submitVotes}
                        >
                            {t('workflows.voting.steps.submitVotes')}
                        </PrimaryButton>
                    </div>
                </div>
            </Content>

            <Footer>
                <PrimaryLink
                    href={prevStep}
                    className="text-sm lg:px-8 lg:py-3"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>{t('Previous')}</span>
                </PrimaryLink>
                <PrimaryButton
                    className="text-sm lg:px-8 lg:py-3"
                    onClick={submitVotes}
                >
                    <span>{t('Complete')}</span>
                </PrimaryButton>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step4;
