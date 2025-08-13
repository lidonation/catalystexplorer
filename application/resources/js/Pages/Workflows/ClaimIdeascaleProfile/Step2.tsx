import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import { StepDetails } from '@/types';
import {
    generateLocalizedRoute,
    useLocalizedRoute,
} from '@/utils/localizedRoute';
import { useForm } from '@inertiajs/react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useRef, useState } from 'react';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import ClaimProfileForm, { ClaimFormHandles, IdeascaleProfileFormFields } from './partials/ClaimProfileForm';

interface Step1Props {
    profile: IdeascaleProfileData;
    stepDetails: StepDetails[];
    activeStep: number;
}

const Step2: React.FC<Step1Props> = ({ profile, stepDetails, activeStep }) => {
    const { t } = useLaravelReactI18n();
    const [isFormValid, setIsFormValid] = useState(false);
    const formRef = useRef<ClaimFormHandles>(null);

    const form = useForm({
        name: profile?.name ?? (profile?.username || ''),
        email: profile?.email || '',
        bio: profile?.bio || '',
        ideascaleProfile: profile?.ideascale || '',
        twitter: profile?.twitter || '',
        discord: profile?.discord || '',
        linkedIn: profile?.linkedin || '',
    });

    const localizedRoute = useLocalizedRoute;
    const prevStep =
        activeStep === 1
            ? ''
            : localizedRoute('workflows.claimIdeascaleProfile.index', {
                  step: activeStep - 1,
              });

    const submitForm = () => {
        if (formRef.current) {
            const formData = formRef.current.getFormData;

            formData.post(
                generateLocalizedRoute(
                    'workflows.claimIdeascaleProfile.saveClaim',
                    {
                        ideascaleProfile: profile.id,
                    },
                ),
                {
                    onError: (errors: Record<keyof IdeascaleProfileFormFields, string>) =>
                        form.setError(errors),
                },
            );
        }
    };

    return (
        <WorkflowLayout asideInfo={stepDetails[activeStep - 1].info ?? ''}>
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            {profile?.id && (
                <Content>
                    <ClaimProfileForm
                        form={form}
                        setIsValid={setIsFormValid}
                        ref={formRef}
                    />
                </Content>
            )}

            {!profile?.id && (
                <Content>
                    <div className="m-4 rounded-lg border border-gray-200 p-4 text-center text-gray-600 lg:m-8">
                        <Paragraph>
                            {t('profileWorkflow.noProfilesFound')}
                        </Paragraph>
                    </div>
                </Content>
            )}

            <Footer>
                <PrimaryLink
                    href={prevStep}
                    className="text-sm lg:px-8 lg:py-3"
                    disabled={activeStep == 1}
                    onClick={(e) => activeStep == 1 && e.preventDefault()}
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>{t('Previous')}</span>
                </PrimaryLink>
                <PrimaryButton
                    className="text-sm lg:px-8 lg:py-3"
                    disabled={!isFormValid || !profile?.id}
                    onClick={() => (isFormValid ? submitForm() : '')}
                >
                    <span>{t('profileWorkflow.claimProfile')}</span>
                    <ChevronRight className="h-4 w-4" />
                </PrimaryButton>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step2;
