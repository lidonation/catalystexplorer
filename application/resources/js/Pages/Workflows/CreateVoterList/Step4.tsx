import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import { StepDetails } from '@/types';
import {
    generateLocalizedRoute,
    useLocalizedRoute,
} from '@/utils/localizedRoute';
import { useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import ValueLabel from '@/Components/atoms/ValueLabel';

interface Step4Props {
    stepDetails: StepDetails[];
    activeStep: number;
    rationale?: string;
    bookmarkHash: string;
}

const Step4: React.FC<Step4Props> = ({
    stepDetails,
    activeStep,
    rationale = '',
    bookmarkHash
}) => {
    const form = useForm({
        rationale: rationale || '',
        bookmarkHash: bookmarkHash,
    });

    const [isFormValid, setIsFormValid] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isFormTouched, setIsFormTouched] = useState(false);

    const localizedRoute = useLocalizedRoute;
    const prevStep = localizedRoute('workflows.createVoterList.index', {
        step: activeStep - 1,
    });

    const { t } = useTranslation();

    useEffect(() => {
        if (!isFormTouched) {
            setIsFormTouched(true);
            return;
        }
        validateForm();
    }, [form.data.rationale]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        
        if (form.data.rationale.length < 200) {
            newErrors.rationale = t('workflows.voterList.errors.rationaleLength');
        }
        
        setErrors(newErrors);
        setIsFormValid(form.data.rationale.trim().length >= 200);
    };

    const handleRationaleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        form.setData('rationale', e.target.value);
    };

    const submitForm = () => {
        form.post(generateLocalizedRoute('workflows.createVoterList.saveRationales'));
    };

    return (
        <WorkflowLayout asideInfo={stepDetails[activeStep - 1].info ?? ''}>
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="flex bg-background items-center justify-center mx-auto px-4 sm:px-6">
                    <form className="rounded-lg shadow-md w-full max-w-md p-4 sm:p-6 border border-gray-200 my-4 sm:my-6">
                        <div
                            onKeyDown={e => e.stopPropagation()}
                            onClick={e => e.stopPropagation()}
                            onFocus={e => e.stopPropagation()}
                            className="mb-4">
                            <ValueLabel
                                className="mb-2 text-content"
                            >
                                {t('workflows.voterList.rationale.label')}
                            </ValueLabel>
                            <textarea
                                id="rationale"
                                value={form.data.rationale}
                                onChange={handleRationaleChange}
                                className="w-full rounded-lg bg-background border border-gray-300 px-3 sm:px-4 py-2 text-sm sm:text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-sm"
                                placeholder={t('workflows.voterList.rationale.placeholder')}
                                rows={6}
                            />
                            <div className="flex justify-between items-center mt-1">
                                <Paragraph size="sm" className="text-gray-persist text-[0.75rem]">
                                    {t('workflows.voterList.rationale.hint')}
                                </Paragraph>
                                <Paragraph size="sm" className="text-gray-persist text-[0.75rem]">
                                    {form.data.rationale.length}/200
                                </Paragraph>
                            </div>
                        </div>
                    </form>
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
                    disabled={!isFormValid}
                    onClick={submitForm}
                >
                    <span>{t('Complete')}</span>
                </PrimaryButton>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step4;