import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Textarea from '@/Components/atoms/Textarea';
import ValueLabel from '@/Components/atoms/ValueLabel';
import { StepDetails } from '@/types';
import {
    generateLocalizedRoute,
    useLocalizedRoute,
} from '@/utils/localizedRoute';
import { useForm } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';

interface Step4Props {
    stepDetails: StepDetails[];
    activeStep: number;
    rationale?: string;
    bookmarkCollection: string;
}

const Step4: React.FC<Step4Props> = ({
    stepDetails,
    activeStep,
    rationale = '',
    bookmarkCollection,
}) => {
    const form = useForm({
        rationale: rationale || '',
    });

    const [isFormValid, setIsFormValid] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isFormTouched, setIsFormTouched] = useState(false);

    const localizedRoute = useLocalizedRoute;
    const prevStep = localizedRoute('workflows.bookmarks.index', {
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
            newErrors.rationale = t(
                'workflows.voterList.errors.rationaleLength',
            );
        }

        setErrors(newErrors);
        setIsFormValid(form.data.rationale.trim().length >= 200);
    };

    const submitForm = () => {
        form.post(
            generateLocalizedRoute('workflows.bookmarks.saveRationales', {
                bookmarkCollection,
            }),
        );
    };

    return (
        <WorkflowLayout asideInfo={stepDetails[activeStep - 1].info ?? ''}>
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="flex h-full items-center justify-center px-8 py-12">
                    <div className="bg-background border-gray-light mx-6 w-full max-w-3xl space-y-6 rounded-lg border p-6 shadow-sm lg:p-8">
                        <div className="mt-3 flex flex-col gap-2">
                            <ValueLabel className="text-content">
                                {t('workflows.voterList.rationale.label')}
                            </ValueLabel>
                            <Textarea
                                placeholder={t(
                                    'workflows.voterList.rationale.placeholder',
                                )}
                                id="rationale"
                                name="rationale"
                                minLengthValue={200}
                                minLengthEnforced
                                required
                                value={form.data.rationale}
                                onChange={(e) =>
                                    form.setData('rationale', e.target.value)
                                }
                                className="h-30 w-full rounded-lg px-4 py-2"
                            />
                            <InputError message={form.errors.rationale} />
                        </div>
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
