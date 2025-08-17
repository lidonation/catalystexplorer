import PrimaryButton from '@/Components/atoms/PrimaryButton';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Textarea from '@/Components/atoms/Textarea';
import InputError from '@/Components/InputError';
import { StepDetails } from '@/types';
import {
    generateLocalizedRoute,
    useLocalizedRoute,
} from '@/utils/localizedRoute';
import { InertiaFormProps, useForm } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import CatalysDrepData = App.DataTransferObjects.CatalystDrepData;

interface Step5Props {
    catalystDrep: CatalysDrepData;
    stepDetails: StepDetails[];
    activeStep: number;
}

export interface DrepSignupFormFields extends CatalysDrepData {}

export interface DrepSignupFormHandles {
    getFormData: InertiaFormProps<DrepSignupFormFields>;
}

const step5: React.FC<Step5Props> = ({
    stepDetails,
    activeStep,
    catalystDrep,
}) => {
    const { t } = useLaravelReactI18n();

    const form = useForm<DrepSignupFormFields>({
        ...catalystDrep,
    });

    const { data, setData } = form;

    const localizedRoute = useLocalizedRoute;

    const submitForm = () => {
        form.patch(
            generateLocalizedRoute('workflows.drepSignUp.patch', {
                catalystDrep: catalystDrep.id,
            }),
            {
                onError: (errors) => {
                    for (const key in errors) {
                        form.setError(
                            key as keyof DrepSignupFormFields,
                            errors[key],
                        );
                    }
                },
            },
        );
    };

    const prevStep = localizedRoute('workflows.drepSignUp.index', {
        step: activeStep - 1,
    });

    const nextStep = localizedRoute('dreps.list');

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
                                value={form.data.objective ?? ''}
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
                                value={form.data.motivation ?? ''}
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
                                value={form.data.qualifications ?? ''}
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
                            className="w-full text-sm lg:px-8 lg:py-2"
                        >
                            {t('workflows.catalystDrepSignup.submitStatement')}
                        </PrimaryButton>
                    </form>
                </div>
            </Content>
            <Footer>
                <PrimaryLink
                    href={prevStep}
                    className="text-sm lg:px-8 lg:py-2"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>{t('Previous')}</span>
                </PrimaryLink>

                <PrimaryLink
                    className="text-sm lg:px-8 lg:py-2"
                    disabled={
                        !catalystDrep.objective ||
                        !catalystDrep.qualifications ||
                        !catalystDrep.motivation
                    }
                    href={nextStep}
                >
                    <span>{t('Next')}</span>
                    <ChevronRight className="h-4 w-4" />
                </PrimaryLink>
            </Footer>
        </WorkflowLayout>
    );
};

export default step5;
