import { useLocalizedRoute } from '@/utils/localizedRoute';
import { ChevronLeft } from 'lucide-react';
import React from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import { SubmitIcon } from '@/Components/svgs/SubmitIcon';
import { StepDetails } from '@/types';

interface Step8Props {
    stepDetails: StepDetails[];
    activeStep: number;
    bookmarkHash: string;
}

const Step8: React.FC<Step8Props> = ({
    stepDetails,
    activeStep,
    bookmarkHash,
}) => {
    const { t } = useLaravelReactI18n();
    const localizedRoute = useLocalizedRoute;
    const prevStep = localizedRoute('workflows.createVoterList.index', {
        step: activeStep - 1,
        bk: bookmarkHash,
    });
    const nextStep = localizedRoute('workflows.createVoterList.index', {
        step: activeStep + 1,
        bk: bookmarkHash,
    });
    return (
        <WorkflowLayout
            title="Create Voter List"
            asideInfo={stepDetails[activeStep - 1]?.info || ''}
            disclaimer={t('workflows.voterList.prototype')}
        >
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="mx-auto w-full max-w-3xl">
                    <div className="flex flex-col items-center justify-center rounded-lg p-6">
                        <Title level="4" className="mb-6 text-center">
                            {t('workflows.voterList.steps.readyToVote')}
                        </Title>
                        <SubmitIcon size={100} />

                        <Paragraph className="text-gray-persist my-4 text-center italic">
                            {t('workflows.voterList.steps.submitReviewedVotes')}
                        </Paragraph>
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
                <PrimaryLink
                    className="text-sm lg:px-8 lg:py-3"
                    href={nextStep}
                >
                    <span>{t('Submit Votes')}</span>
                </PrimaryLink>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step8;
