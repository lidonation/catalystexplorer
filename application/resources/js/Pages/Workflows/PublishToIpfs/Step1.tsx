import React from 'react';
import { usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import WorkflowLayout from '../WorkflowLayout';
import Nav from '../Partials/WorkflowNav';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { StepDetails } from '@/types';
import Paragraph from '@/Components/atoms/Paragraph';

interface Step1Props {
    stepDetails: StepDetails[];
    activeStep: number;
    bookmarkHash?: string;
}

interface PageProps {
    flash: {
        error?: Record<string, string[]>;
        success?: string;
    };
    [key: string]: any;
}

const Step1: React.FC<Step1Props> = ({ 
    stepDetails, 
    activeStep,
    bookmarkHash,
}) => {
    const page = usePage<PageProps>();
    const { t } = useLaravelReactI18n();
    
    const nextStepUrl = generateLocalizedRoute('workflows.publishToIpfs.index', {
        step: 2,
        ...(bookmarkHash && { bookmarkHash }),
    });

    const prevStep = ''; 

    return (
        <WorkflowLayout  
            asideInfo={stepDetails[activeStep - 1].info ?? ''}
            wrapperClassName="!h-auto"
            contentClassName="!max-h-none"
            data-testid="step1-workflow-layout"
        >
            <Nav stepDetails={stepDetails} activeStep={activeStep} data-testid="step1-navigation" />

                <div className="bg-background w-full overflow-y-auto p-6 lg:p-8 overflow-x-visible" data-testid="step1-main-content">
                    <div className="space-y-6 mx-10 mb-24 mt-20" data-testid="step1-content-wrapper">
                        <div data-testid="step1-description-section">
                            <Paragraph className="text-content text-base leading-relaxed mb-6" data-testid="step1-description">
                                {t('workflows.publishToIpfs.description')}
                            </Paragraph>

                            <div className="space-y-3" data-testid="step1-publication-details">
                                <Paragraph size='lg' className="font-semibold text-content mb-4" data-testid="step1-publication-title">{t('workflows.publishToIpfs.whatWillBePublished')}</Paragraph>
                                <ul className="space-y-2" data-testid="step1-publication-list">
                                    <li className="flex items-start" data-testid="step1-list-item-title">
                                        <span className="w-2 h-2 bg-content rounded-full mt-2 mr-3 flex-shrink-0" data-testid="step1-bullet-point"></span>
                                        <Paragraph className="text-content" data-testid="step1-list-description">{t('workflows.publishToIpfs.listTitleDescription')}</Paragraph>
                                    </li>
                                    <li className="flex items-start" data-testid="step1-list-item-items">
                                        <span className="w-2 h-2 bg-content rounded-full mt-2 mr-3 flex-shrink-0" data-testid="step1-bullet-point"></span>
                                        <Paragraph className="text-content" data-testid="step1-items-description">{t('workflows.publishToIpfs.itemsInList')}</Paragraph>
                                    </li>
                                    <li className="flex items-start" data-testid="step1-list-item-metadata">
                                        <span className="w-2 h-2 bg-content rounded-full mt-2 mr-3 flex-shrink-0" data-testid="step1-bullet-point"></span>
                                        <Paragraph className="text-content" data-testid="step1-metadata-description">{t('workflows.publishToIpfs.metadata')}</Paragraph>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div className='mt-8 flex justify-between' data-testid="ipfs-step1-navigation">
                        <PrimaryLink
                            href={prevStep}
                            className="text-sm lg:px-8 lg:py-3"
                            disabled={activeStep == 1}
                            onClick={(e: React.MouseEvent) => activeStep == 1 && e.preventDefault()}
                            data-testid="ipfs-step1-previous-button"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <Paragraph>{t('previous')}</Paragraph>
                        </PrimaryLink>
                        <PrimaryLink
                            href={nextStepUrl}
                            className="text-sm lg:px-8 lg:py-3"
                            data-testid="ipfs-step1-next-button"
                        >
                            <Paragraph>{t('next')}</Paragraph>
                            <ChevronRight className="h-4 w-4" />
                        </PrimaryLink>
                    </div>
                </div>
           
        </WorkflowLayout>
    );
};

export default Step1;
