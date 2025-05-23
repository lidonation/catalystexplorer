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
import { useTranslation } from 'react-i18next';
import RichContent from '@/Components/RichContent';


interface Step1Props {
    stepDetails: StepDetails[];
    activeStep: number;
}

const Step1: React.FC<Step1Props> = ({ stepDetails, activeStep }) => {
    const nextStep = generateLocalizedRoute('workflows.bookmarks.index', {
        step: activeStep + 1,
    });

    const { t } = useTranslation();

    return (
        <WorkflowLayout asideInfo={stepDetails[activeStep - 1].info ?? ''}>
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="bg-background mt-12 flex h-full w-full flex-col items-center justify-center py-12">
                    <div className="mb-8 max-w-2xl">
                        <RichContent
                            className="text-gray-persist"
                            format="markdown"
                            content={t('workflows.bookmarks.intro')}
                        ></RichContent>
                    </div>
                </div>
            </Content>

            <Footer>
                <PrimaryLink
                    href={nextStep}
                    className="ml-auto text-sm lg:px-8 lg:py-3"
                >
                    <span>{t('Next')}</span>
                    <ChevronRight className="h-4 w-4" />
                </PrimaryLink>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step1;