import CatalystLogo from '@/Components/atoms/CatalystLogo';
import ErrorDisplay from '@/Components/atoms/ErrorDisplay';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import TextInput from '@/Components/atoms/TextInput';
import Title from '@/Components/atoms/Title';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { StepDetails } from '@/types';
import {
    generateLocalizedRoute,
    useLocalizedRoute,
} from '@/utils/localizedRoute';
import { Head, Link, useForm } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { FormEventHandler } from 'react';
import Content from '../Partials/WorkflowContent';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';

interface Step2Props {
    stepDetails: StepDetails[];
    activeStep: number;
    token: string;
    email: string;
}

const Step2: React.FC<Step2Props> = ({
    stepDetails,
    activeStep,
    token,
    email,
}) => {
    const { t } = useLaravelReactI18n();
    const resetPasswordRoute = useLocalizedRoute('password.store');

    const asideInfo =
        stepDetails && stepDetails[activeStep - 1]
            ? (stepDetails[activeStep - 1].info ?? '')
            : '';

    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(resetPasswordRoute, {
            onFinish: () => {
                reset('password', 'password_confirmation');
            },
            preserveScroll: true,
        });
    };

    return (
        <WorkflowLayout title="Reset Password" asideInfo={asideInfo}>
            <Head title="Reset Password" />
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="container p-10">
                    <form
                        onSubmit={submit}
                        className="bg-background mx-auto mt-4 min-h-[300px] max-w-md rounded-lg p-6 shadow-lg"
                    >
                        <div className="flex justify-center p-5">
                            <CatalystLogo />
                        </div>

                        <ErrorDisplay />

                        <Title
                            level="4"
                            className="text-content font-inter text-center text-base leading-6 font-bold"
                        >
                            {t('workflows.resetPassword.reset')}
                        </Title>
                        <Paragraph
                            className="text-dark mt-2 mb-2 text-center"
                            children={t(
                                'workflows.resetPassword.enterNewPassword',
                            )}
                        />
                        <div className="mt-4">
                            <InputLabel
                                htmlFor="password"
                                value={t('workflows.resetPassword.newPassword')}
                            />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                isFocused={true}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                            />
                            <InputError
                                message={errors.password}
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-4">
                            <InputLabel
                                htmlFor="password_confirmation"
                                value={t('workflows.resetPassword.newPassword')}
                            />

                            <TextInput
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                onChange={(e) =>
                                    setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                            />

                            <InputError
                                message={errors.password_confirmation}
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-4 flex items-center justify-end">
                            <PrimaryButton
                                className="w-full py-3"
                                disabled={processing}
                            >
                                {t('workflows.resetPassword.submit')}
                            </PrimaryButton>
                        </div>
                        <div className="flex w-full items-center justify-center gap-1 p-6">
                            <Paragraph>
                                {t(
                                    'workflows.resetPassword.alreadyHaveAccount',
                                )}
                            </Paragraph>
                            <Link
                                href={generateLocalizedRoute('register')}
                                className="text-primary ml-1 font-medium hover:underline"
                            >
                                {t('signup')}
                            </Link>
                        </div>
                    </form>
                </div>
            </Content>
        </WorkflowLayout>
    );
};

export default Step2;
