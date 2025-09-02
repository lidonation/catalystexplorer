import ErrorDisplay from '@/Components/atoms/ErrorDisplay';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import { StepDetails } from '@/types';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { useForm } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ChevronRight } from 'lucide-react';
import React, { useRef, useState } from 'react';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import DrepSignupForm, {
    DrepSignupFormFields,
    DrepSignupFormHandles,
} from './partials/DrepSignupForm';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import CatalystDrepData = App.DataTransferObjects.CatalystDrepData;

interface Step1Props {
    profile: IdeascaleProfileData;
    stepDetails: StepDetails[];
    activeStep: number;
    catalystDrep?: CatalystDrepData;
    savedLocale: string;
}

const Step1: React.FC<Step1Props> = ({
    stepDetails,
    activeStep,
    catalystDrep,
    savedLocale,
}) => {
    const { t } = useLaravelReactI18n();
    const [isFormValid, setIsFormValid] = useState(false);
    const formRef = useRef<DrepSignupFormHandles>(null);

    const form = useForm<DrepSignupFormFields>({
        name: catalystDrep?.name ?? '',
        email: catalystDrep?.email ?? '',
        bio: catalystDrep?.bio ?? '',
        link: catalystDrep?.link ?? '',
        willMaintain: false,
        locale: savedLocale,
    });

    const submitForm = () => {
        if (formRef.current) {
            const formData = formRef.current.getFormData;

            if (!formData.data.willMaintain) {
                form.setError({ willMaintain: '1' });
                return;
            }

            // Validate language consistency before submission
            const languageValidation = formRef.current.validateLanguages();
            if (!languageValidation.isValid) {
                form.setError({
                    bio:
                        languageValidation.message ||
                        t('languageDetection.defaultMismatchError'),
                });
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
        <WorkflowLayout
            title="Drep SignUp"
            asideInfo={stepDetails[activeStep - 1].info ?? ''}
            disclaimer={t('workflows.voterList.prototype')}
        >
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                {/* Error Messages */}
                <ErrorDisplay />

                <DrepSignupForm
                    form={form}
                    setIsValid={setIsFormValid}
                    ref={formRef}
                    savedLocale={savedLocale}
                />
            </Content>

            <Footer>
                <PrimaryButton
                    className="ml-auto text-sm lg:px-8 lg:py-3"
                    disabled={!isFormValid}
                    onClick={() => (isFormValid ? submitForm() : '')}
                >
                    <span>{t('listQuickCreate.create')}</span>
                    <ChevronRight className="h-4 w-4" />
                </PrimaryButton>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step1;
