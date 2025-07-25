import { Head, Link, useForm } from "@inertiajs/react";
import WorkflowLayout from "../WorkflowLayout";
import Nav from "../Partials/WorkflowNav";
import Content from "../Partials/WorkflowContent";
import { StepDetails } from '@/types';
import Paragraph from "@/Components/atoms/Paragraph";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/atoms/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/atoms/PrimaryButton";
import {useLaravelReactI18n} from "laravel-react-i18n";
import { FormEventHandler, useState } from "react";
import CatalystLogo from "@/Components/atoms/CatalystLogo";
import Title from "@/Components/atoms/Title";
import { generateLocalizedRoute, useLocalizedRoute } from "@/utils/localizedRoute";

interface Step2Props {
    stepDetails: StepDetails[];
    activeStep: number;
    token: string;
    email: string;
}

const Step2: React.FC<Step2Props> = ({ stepDetails, activeStep, token, email }) => {
    const { t } = useLaravelReactI18n();
    const resetPasswordRoute = useLocalizedRoute('password.store');

    const asideInfo = stepDetails && stepDetails[activeStep - 1]
        ? stepDetails[activeStep - 1].info ?? ''
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
        <WorkflowLayout asideInfo={asideInfo}>
            <Head title='Reset Password'/>
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="container p-10">
                    <form onSubmit={submit} className="mt-4 max-w-md min-h-[300px] mx-auto p-6 bg-background rounded-lg shadow-lg">
                        <div className="flex justify-center p-5">
                            <CatalystLogo />
                        </div>
                        <Title level='4' className='text-content text-center font-inter text-base font-bold leading-6'>
                            {t('workflows.resetPassword.reset')}
                        </Title>
                        <Paragraph className='text-center text-dark mt-2 mb-2' children={t('workflows.resetPassword.enterNewPassword')}/>
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
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <InputError message={errors.password} className="mt-2" />
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
                                    setData('password_confirmation', e.target.value)
                                }
                            />

                            <InputError
                                message={errors.password_confirmation}
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-4 flex items-center justify-end">
                            <PrimaryButton className="w-full py-3" disabled={processing}>
                               {t('workflows.resetPassword.submit')}
                            </PrimaryButton>
                        </div>
                        <div className="p-6 gap-1 flex w-full items-center justify-center">
                            <Paragraph>{t('workflows.resetPassword.alreadyHaveAccount')}</Paragraph>
                            <Link
                                href={generateLocalizedRoute('register')}
                                className="text-primary font-medium hover:underline ml-1"
                            >
                                {t('signup')}
                            </Link>
                        </div>
                    </form>
                </div>
            </Content>
        </WorkflowLayout>
    );
}

export default Step2;
