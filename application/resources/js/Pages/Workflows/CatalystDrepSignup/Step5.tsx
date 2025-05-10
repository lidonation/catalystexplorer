import PrimaryButton from '@/Components/atoms/PrimaryButton';
import Textarea from '@/Components/atoms/Textarea';
import { StepDetails } from '@/types';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { FormDataConvertible } from '@inertiajs/core';
import { InertiaFormProps, useForm } from '@inertiajs/react';
import { t } from 'i18next';
import React from 'react';
import Content from '../Partials/WorkflowContent';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import InputError from '@/Components/InputError';

interface Step5Props {
    catalystDrep: string;
    stepDetails: StepDetails[];
    activeStep: number;
}

export interface DrepSignupFormFields
    extends Record<string, FormDataConvertible> {
    objective: string;
    qualifications: string;
    motivation: string;
}

export interface DrepSignupFormHandles {
    getFormData: InertiaFormProps<DrepSignupFormFields>;
}

const step5: React.FC<Step5Props> = ({ stepDetails, activeStep, catalystDrep}) => {
    const form = useForm<DrepSignupFormFields>({
        objective: '',
        qualifications: '',
        motivation: '',
    });

    const { data, setData } = form;

    const submitForm = () => {

        form.patch(
            generateLocalizedRoute('workflows.drepSignUp.patch', {
                catalystDrep,
            }),
            {
                onError: (errors: Record<keyof DrepSignupFormFields, string>) =>
                    form.setError(errors),
            },
        );
    };

    return (
        <WorkflowLayout asideInfo={stepDetails[activeStep - 1].info ?? ''}>
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="@container mx-auto mb-6 w-full max-w-2xl px-4">
                    <div className="bg-primary-light mb-6 rounded-lg p-4 text-center">
                        <p className="text-slate-500">
                            {t(
                                'workflows.catalystDrepSignup.platformStatementMsg',
                            )}
                        </p>
                    </div>

                    <form className="mb-8 space-y-6">
                        {/* Bio */}
                        <div className="mt-3">
                            <label htmlFor="bio" className="mb-1 font-bold">
                                {t('workflows.catalystDrepSignup.objectives')}
                            </label>
                            <Textarea
                                id="objectives"
                                name="objectives"
                                placeholder={t(
                                    'workflows.catalystDrepSignup.objectivesPlaceholder',
                                )}
                                required
                                minLengthEnforced
                                value={form.data.objective}
                                onChange={(e) =>
                                    setData('objective', e.target.value)
                                }
                                className="h-30 w-full rounded-lg px-4 py-2"
                            />
                            <InputError message={form.errors.objective} />
                        </div>

                        {/* Bio */}
                        <div className="mt-3">
                            <label
                                htmlFor="motivations"
                                className="mb-1 font-bold"
                            >
                                {t('workflows.catalystDrepSignup.motivations')}
                            </label>
                            <Textarea
                                id="motivations"
                                name="motivations"
                                placeholder={t(
                                    'workflows.catalystDrepSignup.motivationsPlaceholder',
                                )}
                                required
                                minLengthEnforced
                                value={form.data.motivation}
                                onChange={(e) =>
                                    setData('motivation', e.target.value)
                                }
                                className="h-30 w-full rounded-lg px-4 py-2"
                            />
                            <InputError message={form.errors.motivation} />
                        </div>

                        {/* Bio */}
                        <div className="mt-3">
                            <label
                                htmlFor="qualifications"
                                className="mb-1 font-bold"
                            >
                                {t(
                                    'workflows.catalystDrepSignup.qualifications',
                                )}
                            </label>
                            <Textarea
                                id="qualifications"
                                name="qualifications"
                                required
                                placeholder={t(
                                    'workflows.catalystDrepSignup.qualificationsPlaceholder',
                                )}
                                minLengthEnforced
                                value={form.data.qualifications}
                                onChange={(e) =>
                                    setData('qualifications', e.target.value)
                                }
                                className="h-30 w-full rounded-lg px-4 py-2"
                            />
                            <InputError message={form.errors.qualifications} />
                        </div>
                        <PrimaryButton
                            onClick={() => submitForm()}
                            type="button"
                            className="w-full text-sm"
                        >
                            {t('workflows.catalystDrepSignup.submitStatement')}
                        </PrimaryButton>
                    </form>
                </div>
            </Content>
        </WorkflowLayout>
    );
};

export default step5;
