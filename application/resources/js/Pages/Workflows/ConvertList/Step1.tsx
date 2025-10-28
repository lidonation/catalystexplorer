import PrimaryButton from '@/Components/atoms/PrimaryButton';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import Paragraph from '@/Components/atoms/Paragraph';
import { ConvertListWorkflowParams } from '@/enums/convert-list-workflow-params';
import { ConversionType } from '@/enums/conversion-type';
import { StepDetails } from '@/types';
import { generateLocalizedRoute, useLocalizedRoute } from '@/utils/localizedRoute';
import { useForm } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import React from 'react';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;
import CheckIcon from '@/Components/svgs/CheckIcon';
import TickIcon from '@/Components/svgs/TickIcon';

interface ValidationCheck {
    label: string;
    passed: boolean;
    required: boolean;
    fundTitle?: string;
}

interface ValidationResults {
    checks: ValidationCheck[];
    canConvert: boolean;
}

interface Step1Props {
    stepDetails: StepDetails[];
    activeStep: number;
    collection: BookmarkCollectionData;
    currentType: string;
    conversionType: ConversionType;
    validationResults: ValidationResults;
    canConvert: boolean;
}

const Step1: React.FC<Step1Props> = ({
    stepDetails,
    activeStep,
    collection,
    currentType,
    conversionType,
    validationResults,
    canConvert,
}) => {
    const { t } = useLaravelReactI18n();

    const form = useForm({
        [ConvertListWorkflowParams.COLLECTION_HASH]: collection.id,
        [ConvertListWorkflowParams.CONVERSION_TYPE]: conversionType,
    });

    const handleConvert = () => {
        form.post(
            generateLocalizedRoute('workflows.convertList.convert'),
            {
                onSuccess: () => {
                  
                },
                onError: (errors) => {
                    console.error('Conversion failed:', errors);
                },
            }
        );
    };

    const cancelRoute = useLocalizedRoute('my.lists.manage', {
        bookmarkCollection: collection.id,
        type: 'proposals',
    });

    const getConversionTitle = () => {
        if (conversionType === ConversionType.TO_VOTER) {
            return t('workflows.convertList.convertToVoterList');
        }
        return t('workflows.convertList.convertToResearchList');
    };

    return (
        <WorkflowLayout
            title={getConversionTitle()}
            asideInfo={stepDetails[activeStep - 1].info ?? ''}
            wrapperClassName="!h-auto"
            contentClassName="!max-h-none"
        >
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="bg-background w-full overflow-y-auto p-6 lg:p-8">
                    <div className="mx-auto max-w-3xl space-y-8">
                        {/* Header */}
                        <div className="text-center space-y-4">
                            <Title level="3" className="font-bold">
                                {getConversionTitle()}
                            </Title>
                        </div>

                        {/* Validation Checklist */}
                        <div className="space-y-4">
                            <div className="space-y-3">
                                {validationResults.checks.map((check, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center justify-center gap-3`}
                                    >
                                        <div className="flex-shrink-0">
                                            {check.passed ? (
                                                <div className="flex items-center justify-center h-6 w-6 rounded-md bg-success">
                                                    <TickIcon className="h-6 w-6 text-white" />
                                                </div>
                                            ) : (
                                                <XCircle className="h-6 w-6 text-error" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <Paragraph
                                                className={`font-medium text-gray-persist`}
                                            >
                                                {check.label}
                                            </Paragraph>
                                            {check.fundTitle && (
                                                <Paragraph className="text-sm text-light-gray-persist mt-1">
                                                    {t('Fund')}: {check.fundTitle}
                                                </Paragraph>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Content>

            <Footer>
                <div className="flex justify-end items-center w-full">
                    <PrimaryButton
                        onClick={handleConvert}
                        disabled={!canConvert || form.processing}
                        className="text-sm lg:px-8 lg:py-3"
                        data-testid="convert-list-confirm-button"
                    >
                        {form.processing
                            ? t('workflows.convertList.converting')
                            : t('workflows.convertList.confirmConversion')}
                        <ChevronRight className="h-4 w-4" />
                    </PrimaryButton>
                </div>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step1;
