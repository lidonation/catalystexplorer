import PrimaryButton from '@/Components/atoms/PrimaryButton';
import { StepDetails } from '@/types';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { useForm } from '@inertiajs/react';
import { t } from 'i18next';
import { ChevronRight } from 'lucide-react';
import React, { useRef, useState } from 'react';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import { FormDataConvertible } from '@inertiajs/core';
import { InertiaFormProps } from '@inertiajs/react';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import Textarea from '@/Components/atoms/Textarea';

interface Step1Props {
    profile: IdeascaleProfileData;
    stepDetails: StepDetails[];
    activeStep: number;
}

export interface DrepSignupFormFields extends Record<string, FormDataConvertible> {
    objectives: string;
    qualifications: string;
    motivations: string;
}

export interface DrepSignupFormHandles {
    getFormData: InertiaFormProps<DrepSignupFormFields>;
}


const Step1: React.FC<Step1Props> = ({ stepDetails, activeStep }) => {
    const [isFormValid, setIsFormValid] = useState(false);
    const formRef = useRef<DrepSignupFormHandles>(null);

    const form = useForm<DrepSignupFormFields>({
        objectives: '',
        qualifications: '',
        motivations: '',
    });

    const { data, setData } = form;

    const submitForm = () => {
        if (formRef.current) {
            const formData = formRef.current.getFormData;

            if (!formData.data.willMaintain) {
                form.setError({ willMaintain: '1' });
                return;
            }

            formData.post(
                generateLocalizedRoute('workflows.drepSignUp.create'),
                {
                    onError: (
                        errors: Record<keyof DrepSignupFormFields, string>,
                    ) => form.setError(errors),
                },
            );
        }
    };

    return (
        <WorkflowLayout asideInfo={stepDetails[activeStep - 1].info ?? ''}>
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="mx-auto w-full max-w-2xl">
                    <div className="mb-6 rounded-lg bg-sky-50 p-4 text-center">
                        <p className="text-lg text-slate-500">
                            Platform Statement. Let the community know who you
                            are and what you stand for.
                        </p>
                    </div>

                    <form onSubmit={submitForm} className="space-y-6">
                        <div className="space-y-2">
                            <label
                                htmlFor="objectives"
                                className="text-lg font-medium"
                            >
                                1. Your objectives
                            </label>
                            <Textarea
                                id="objectives"
                                name="objectives"
                                value={form.data.objectives}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="Write about your values and your approach to governance..."
                                className="min-h-[120px] border-slate-200 p-4 text-base"
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="motivations"
                                className="text-lg font-medium"
                            >
                                2. Motivations
                            </label>
                            <Textarea
                                id="motivations"
                                name="motivations"
                                value={form.data.motivations}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="Highlight your strengths, commitments and vision for the community..."
                                className="min-h-[120px] border-slate-200 p-4 text-base"
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="qualifications"
                                className="text-lg font-medium"
                            >
                                3. Qualifications
                            </label>
                            <Textarea
                                id="qualifications"
                                name="qualifications"
                                value={form.data.qualifications}
                                onChange={(e) =>
                                    setData('qualifications', e.target.value)
                                }
                                placeholder=""
                                className="min-h-[120px] border-slate-200 p-4 text-base"
                            />
                        </div>

                        <PrimaryButton
                            type="submit"
                            className="w-full bg-blue-500 py-6 text-lg hover:bg-blue-600"
                        >
                            Submit Statement
                        </PrimaryButton>
                    </form>
                </div>
            </Content>

            {/* <Footer>
                <PrimaryButton
                    className="ml-auto text-sm lg:px-8 lg:py-3"
                    disabled={!isFormValid}
                    onClick={() => (isFormValid ? submitForm() : '')}
                >
                    <span>{t('profileWorkflow.claimProfile')}</span>
                    <ChevronRight className="h-4 w-4" />
                </PrimaryButton>
            </Footer> */}
        </WorkflowLayout>
    );
};

export default Step1;
