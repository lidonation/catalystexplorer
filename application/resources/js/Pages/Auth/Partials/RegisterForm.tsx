import TextInput from '@/Components/atoms/TextInput';
import InputError from '@/Components/InputError';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { Link, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '../../../Components/atoms/PrimaryButton';
import InputLabel from '../../../Components/InputLabel';
import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';

interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
    password_confirmation?: string;
}

interface RegisterFormProps {
    closeModal?: () => void;
}

export default function RegisterForm({ closeModal }: RegisterFormProps) {
    const { data, setData, processing, post, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(generateLocalizedRoute('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
            onSuccess: () => {
                if (closeModal) closeModal();
                router.visit(generateLocalizedRoute('my.dashboard'));
            },
            onError: (errors) => setErrors(errors),
        });
    };

    const { t } = useTranslation();

    const handleLoginClick = () => {
        if (closeModal) closeModal();
        router.get(generateLocalizedRoute('login'));
    };

    return (
        <form onSubmit={submit} className="content-gap flex flex-col">
            <div>
                <InputLabel htmlFor="name" value="Name" />

                <TextInput
                    id="name"
                    name="name"
                    value={data.name}
                    className="mt-1 block w-full"
                    autoComplete="name"
                    isFocused={true}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                />

                <InputError message={errors?.name} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="email" value={t('email')} />

                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className="mt-1 block w-full"
                    autoComplete="username"
                    onChange={(e) => setData('email', e.target.value)}
                    required
                />

                <InputError message={errors?.email} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="password" value={t('password')} />

                <TextInput
                    id="password"
                    type="password"
                    name="password"
                    value={data.password}
                    className="mt-1 block w-full"
                    autoComplete="new-password"
                    onChange={(e) => setData('password', e.target.value)}
                    required
                />
                <Paragraph className="text-4 text-dark mt-1">
                    {t('registration.passwordCharacters')}
                </Paragraph>
                <InputError message={errors?.password} className="mt-2" />
            </div>

            <div>
                <InputLabel
                    htmlFor="password_confirmation"
                    value={t('confirmPassword')}
                />

                <TextInput
                    id="password_confirmation"
                    type="password"
                    name="password_confirmation"
                    value={data.password_confirmation}
                    className="mt-1 block w-full"
                    autoComplete="new-password"
                    onChange={(e) =>
                        setData('password_confirmation', e.target.value)
                    }
                    required
                />

                <InputError
                    message={errors?.password_confirmation}
                    className="mt-2"
                />
            </div>

            <div>
                <PrimaryButton
                    className="flex h-10 w-full items-center justify-center rounded-md"
                    disabled={processing}
                    type="submit"
                >
                    {t('getStarted')}
                </PrimaryButton>
            </div>

            <div className="flex w-full items-center justify-center">
                <Paragraph className="mr-2">{t('registration.alreadyRegistered')}</Paragraph>
                <Button
                    type="button"
                    onClick={handleLoginClick}
                    className="text-primary hover:text-content rounded-md font-bold focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
                >
                    {t('login')}
                </Button>
            </div>
        </form>
    );
}
