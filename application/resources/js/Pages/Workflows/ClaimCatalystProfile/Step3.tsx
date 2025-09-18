import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import {
    generateLocalizedRoute,
    useLocalizedRoute,
} from '@/utils/localizedRoute';
import { useForm } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ChevronLeft } from 'lucide-react';
import { useRef, useState } from 'react';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import CatalystProfileForm, {
    CatalystProfileFormFields,
    CatalystProfileFormHandles,
} from './Partials/CatalystProfileForm';
import ErrorComponent from './Partials/Error';

interface Step3Props {
    stepDetails: any[];
    activeStep: number;
    catalystProfile: App.DataTransferObjects.CatalystProfileData;
    stakeAddress: string;
}

export default function Step3({
    stepDetails,
    activeStep,
    catalystProfile,
    stakeAddress,
}: Step3Props) {
    const localizedRoute = useLocalizedRoute;
    const { t } = useLaravelReactI18n();
    const prevStep = localizedRoute('workflows.claimCatalystProfile.index', {
        step: activeStep - 1,
    });

    const [isFormValid, setIsFormValid] = useState(false);
    const formRef = useRef<CatalystProfileFormHandles>(null);

    const form = useForm({
        name: catalystProfile?.name || '',
        username: catalystProfile?.username || '',
        catalystId: catalystProfile?.catalyst_id || '',
        stakeAddress: stakeAddress || '',
    });

    const submitForm = () => {
        if (formRef.current) {
            const formData = formRef.current.getFormData;

            formData.post(
                generateLocalizedRoute(
                    'workflows.claimCatalystProfile.claimCatalystProfile',
                    {
                        catalystProfile: catalystProfile.id,
                    },
                ),
                {
                    onError: (
                        errors: Record<keyof CatalystProfileFormFields, string>,
                    ) => form.setError(errors),
                },
            );
        }
    };

    return (
        <WorkflowLayout title="Claim Catalyst Profile">
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="bg-background mx-auto my-8 flex h-3/4 w-[calc(100%-4rem)] items-center justify-center rounded-lg p-8 md:w-3/4">
                    {catalystProfile ? (
                        <div className="flex flex-col gap-3">
                            <Title level="3" className='text-center'>
                                {t(
                                    'workflows.claimCatalystProfile.confirmDetails',
                                )}
                            </Title>
                            <Paragraph className="text-content/50 text-center">
                                {t(
                                    'workflows.claimCatalystProfile.reviewDetails',
                                )}
                            </Paragraph>
                            <CatalystProfileForm
                                form={form}
                                setIsValid={setIsFormValid}
                                ref={formRef}
                            />
                        </div>
                    ) : (
                        <ErrorComponent />
                    )}
                </div>
            </Content>
            <Footer>
                <PrimaryLink
                    href={prevStep}
                    className="text-sm lg:px-8 lg:py-3"
                    onClick={(e) => activeStep == 1 && e.preventDefault()}
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>{t('Previous')}</span>
                </PrimaryLink>
                {catalystProfile && (
                    <Button
                        className="bg-success px-4 py-2 text-sm text-white lg:px-8 lg:py-3"
                        disabled={!isFormValid || !catalystProfile?.id}
                        onClick={() => (isFormValid ? submitForm() : '')}
                    >
                        <span>{t('profileWorkflow.claimProfile')}</span>
                    </Button>
                )}
            </Footer>
        </WorkflowLayout>
    );
}
