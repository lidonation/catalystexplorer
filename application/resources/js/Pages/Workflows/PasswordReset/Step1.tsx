import { Head, useForm } from "@inertiajs/react";
import WorkflowLayout from "../WorkflowLayout";
import { StepDetails } from '@/types';
import { FormEventHandler, useState, useEffect } from "react";
import TextInput from "@/Components/atoms/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/atoms/PrimaryButton";
import Nav from "../Partials/WorkflowNav";
import { useLocalizedRoute } from "@/utils/localizedRoute";
import Paragraph from "@/Components/atoms/Paragraph";
import CatalystLogo from "@/Components/atoms/CatalystLogo";
import Title from "@/Components/atoms/Title";
import Content from "../Partials/WorkflowContent";
import {useLaravelReactI18n} from "laravel-react-i18n";
import CheckInbox from "@/Components/svgs/CheckInbox";
import ErrorDisplay from "@/Components/atoms/ErrorDisplay";

interface Step1Props {
    stepDetails: StepDetails[];
    activeStep: number;
    status?: string;
}

type Step1State = 'email-form' | 'confirmation';

const Step1: React.FC<Step1Props> = ({ stepDetails, activeStep, status }) => {
    const { t } = useLaravelReactI18n();
    const [currentState, setCurrentState] = useState<Step1State>('email-form');
    const [emailSent, setEmailSent] = useState(false);

    const forgotPasswordRoute = useLocalizedRoute('password.forgot');
    const resetEmailRoute = useLocalizedRoute('password.store');

    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    useEffect(() => {
        if (status && status.length > 0) {
            setCurrentState('confirmation');
            setEmailSent(true);
        }
    }, [status]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(forgotPasswordRoute, {
            onSuccess: () => {
                setCurrentState('confirmation');
                setEmailSent(true);
            }
        });
    };

    const handleResendEmail = () => {
        post(resetEmailRoute);
    };

    return (
        <WorkflowLayout
            title="Reset Password"
            asideInfo={stepDetails[activeStep - 1].info ?? ''}
        >
            <Head title="Forgot Password" />
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <ErrorDisplay />

                {currentState === 'email-form' && (
                    <div className="container p-10">
                        {status && (
                            <div className="text-4 text-content-success mb-4 font-medium">
                                {status}
                            </div>
                        )}

                        <form
                            onSubmit={submit}
                            className="bg-background mx-auto mt-4 min-h-[300px] max-w-md rounded-lg p-6 shadow"
                        >
                            <div className="mt-4 flex flex-col">
                                <div className="flex justify-center p-5">
                                    <CatalystLogo />
                                </div>
                                <Paragraph
                                    className="text-dark mb-4 text-center"
                                    children={t(
                                        'workflows.resetPassword.enterEmail',
                                    )}
                                />
                                <label htmlFor="email" className="text-dark">
                                    {t('workflows.resetPassword.email')}
                                </label>
                                <TextInput
                                    id="email"
                                    type="email"
                                    placeholder={t(
                                        'workflows.resetPassword.email',
                                    )}
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full"
                                    isFocused={true}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                />

                                <InputError
                                    message={errors.email}
                                    className="mt-2"
                                />
                            </div>

                            <div className="py-4">
                                <PrimaryButton
                                    className="w-full py-3"
                                    disabled={processing}
                                >
                                    {t('workflows.resetPassword.continue')}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                )}

                {currentState === 'confirmation' && (
                    <div className="bg-background m-8 mx-auto min-h-[300px] max-w-md rounded-lg p-6 p-10 shadow-lg">
                        <div className="flex justify-center p-5">
                            <CatalystLogo />
                        </div>
                        <Title
                            level="4"
                            className="text-content font-inter mb-4 text-center text-base leading-6 font-bold"
                        >
                            {t('workflows.resetPassword.checkInbox')}
                        </Title>

                        <div className="mb-4 flex justify-center">
                            <CheckInbox className="h-[87px] w-[87px]" />
                        </div>

                        <div className="text-4 text-dark mb-6">
                            <Paragraph>
                                {t('workflows.resetPassword.sent')}
                            </Paragraph>
                        </div>

                        <PrimaryButton
                            onClick={handleResendEmail}
                            disabled={processing}
                            className="w-full py-3"
                        >
                            {t('workflows.resetPassword.resend')}
                        </PrimaryButton>
                    </div>
                )}
            </Content>
        </WorkflowLayout>
    );
};

export default Step1;
