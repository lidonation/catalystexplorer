import Button from '@/Components/atoms/Button';
import Checkbox from '@/Components/atoms/Checkbox';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import TextInput from '@/Components/atoms/TextInput';
import Title from '@/Components/atoms/Title';
import ConnectWalletButton from '@/Components/ConnectWalletButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/layout/Modal.tsx';
import RichContent from '@/Components/RichContent';
import { useConnectWallet } from '@/Context/ConnectWalletSliderContext';
import { useIntendedUrl } from '@/useHooks/useIntendedUrl';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { router, useForm } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { FormEventHandler, useState, useEffect } from 'react';

interface FormErrors {
    email?: string;
    password?: string;
}

interface LoginFormProps {
    closeModal?: () => void;
    intendedUrl?: string;
}

export default function LoginForm({ closeModal, intendedUrl }: LoginFormProps) {
    const { intendedUrl: hookIntendedUrl, clearIntendedUrl } = useIntendedUrl();

    const finalIntendedUrl = intendedUrl || hookIntendedUrl || '';

    const { data, setData, reset, processing } = useForm({
        email: '',
        password: '',
        remember: false,
        redirect: finalIntendedUrl,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [activeConfirm, setActiveConfirm] = useState<boolean>(false);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        if (!validateEmail(data.email)) {
            newErrors.email = t('validation.emailFormat');
            isValid = false;
        }

        if (!data.password) {
            newErrors.password = t('validation.required');
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        router.post(
            generateLocalizedRoute('login'),
            {
                email: data.email,
                password: data.password,
                remember: data.remember,
                redirect: data.redirect,
            },
            {
                onSuccess: () => {
                    reset('password');
                    clearIntendedUrl();
                },
                onError: (serverErrors) => {
                    console.log('Login error ', serverErrors);
                    setErrors(serverErrors);
                },
            },
        );
    };

    const {
        connectedWalletProvider,
        openConnectWalletSlider,
        userAddress,
        extractSignature,
        stakeAddress,
        stakeKey,
    } = useConnectWallet();

    const { t } = useLaravelReactI18n();

    const handleForgotPassword = () => {
        if (closeModal) closeModal();
        router.get(generateLocalizedRoute('password.request'));
    };

    const handleRegister = () => {
        if (closeModal) closeModal();
        router.get(generateLocalizedRoute('register'));
    };

    const handleLogin = async () => {
        if (!connectedWalletProvider || !userAddress) {
            console.error('Wallet not connected');
            return;
        }
        try {
            const messageToSign = 'Catalyst Explorer Account sign in';

            // Extract signature using the wallet
            const signatureResult = await extractSignature(messageToSign);

            if (!signatureResult) {
                console.error('Failed to get signature');
                return;
            }
            router.post(
                generateLocalizedRoute('login.wallet'),
                {
                    walletAddress: userAddress,
                    stake_key: stakeKey,
                    stakeAddress: stakeAddress,
                    signature: signatureResult.signature,
                    signature_key: signatureResult.key,
                    redirect: data.redirect,
                },
                {
                    onSuccess: () => {
                        clearIntendedUrl();
                    },
                    onError: (errors) => {
                        console.error('Wallet connection errors:', errors);
                    },
                },
            );
        } catch (error) {
            console.error('Error during signature process:', error);
        }
    };

    return (
        <>


            <form
                className="content-gap flex w-full flex-col p-4"
                data-testid="login-form"
            >
                <div>


                    <InputLabel
                        htmlFor="email"
                        value={t('email')}
                        data-testid="email-input-label"
                    />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        data-testid="email-input"
                    />

                    <InputError
                        message={errors?.email}
                        className="mt-2"
                        data-testid="email-error-text"
                    />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password"
                        value={t('password')}
                        data-testid="password-input-label"
                    />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                        data-testid="password-input"
                    />

                    <InputError
                        message={errors?.password}
                        className="mt-2"
                        data-testid="password-error-text"
                    />
                </div>

                <div className="flex justify-between">
                    <div className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked as false)
                            }
                            data-testid="remember-me-checkbox"
                        />
                        <Paragraph className="text-4 text-dark ms-2">
                            {t('rememberMe')}
                        </Paragraph>
                    </div>
                    <div>
                        <Button
                            type="button"
                            onClick={handleForgotPassword}
                            className="text-4 text-primary hover:text-content focus:border-x-border-secondary focus:ring-offset font-bold focus:ring-2 focus:outline-hidden"
                            data-testid="forgot-password-button"
                        >
                            {t('forgotPassword')}
                        </Button>
                    </div>
                </div>

                <div>
                    <PrimaryButton
                        className="flex h-10 w-full items-center justify-center rounded-md"
                        disabled={processing}
                        onClick={(e) => submit(e)}
                        data-testid="login-submit-button"
                    >
                        {t('signin')}
                    </PrimaryButton>
                </div>

                <div className="flex flex-col gap-2">
                    <ConnectWalletButton />

                    <PrimaryButton
                        className="flex h-10 w-full items-center justify-center rounded-md"
                        disabled={processing || !connectedWalletProvider}
                        type="submit"
                        data-testid="wallet-submit-button"
                        onClick={() => setActiveConfirm(true)}
                    >
                        {t('wallet.login')}
                    </PrimaryButton>
                </div>

                <div
                    className="flex w-full items-center justify-center"
                    data-testid="login-no-account"
                >
                    <Paragraph className="text-4 mr-2">
                        {t('registration.noAccount')}
                    </Paragraph>
                    <Button
                        type="button"
                        onClick={handleRegister}
                        className="text-4 text-primary hover:text-content font-bold focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
                        data-testid="register-button"
                    >
                        {t('signup')}
                    </Button>
                </div>
            </form>

            <Modal
                title={t('bookmarks.editList')}
                isOpen={!!activeConfirm}
                onClose={() => setActiveConfirm(false)}
                logo={false}
                centered
            >
                <div className="flex flex-col gap-4 p-4 text-center">
                    <Title level="5">{t('wallet.login')}</Title>

                    <RichContent
                        content={t('wallet.login.confirm')}
                        format={'html'}
                    />

                    <div className="flex justify-between gap-4">
                        <PrimaryButton
                            onClick={() => setActiveConfirm(false)}
                            className="bg-primary flex-1 font-semibold"
                        >
                            {t('Cancel')}
                        </PrimaryButton>

                        <Button
                            onClick={() => handleLogin()}
                            className="bg-danger-mid text-content-light flex-1 rounded-md py-1.5 font-semibold"
                        >
                            {t('workflows.resetPassword.continue')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
