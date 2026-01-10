import PrimaryButton from '@/Components/atoms/PrimaryButton';
import Textarea from '@/Components/atoms/Textarea';
import TextInput from '@/Components/atoms/TextInput';
import Title from '@/Components/atoms/Title';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import DiscordIcon from '@/Components/svgs/DiscordIcon';
import XIcon from '@/Components/svgs/XIcon';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { Head, router, useForm } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { FormEventHandler, useState } from 'react';

interface FormErrors {
    name?: string;
    email?: string;
    message?: string;
}

export default function Support() {
    const { t } = useLaravelReactI18n();

    const { data, setData, reset, processing } = useForm({
        name: '',
        email: '',
        message: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [success, setSuccess] = useState<string>('');

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setSuccess('');
        router.post(
            generateLocalizedRoute('support.submit'),
            {
                name: data.name,
                email: data.email,
                message: data.message,
            },
            {
                onSuccess: () => {
                    reset();
                    setSuccess(t('support.successMessage'));
                    setErrors({});
                },
                onError: (errors) => setErrors(errors),
            },
        );
    };

    const socialHandles = [
        {
            name: 'X (Twitter)',
            handle: '@lidonation',
            url: 'https://x.com/lidonation',
            icon: XIcon,
        },
        {
            name: 'Telegram',
            handle: '@lidonation',
            url: 'https://t.me/lidonation',
            icon: () => (
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="fill-current"
                >
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
                </svg>
            ),
        },
        {
            name: 'Discord',
            handle: '@lidonation',
            url: 'https://discord.gg/lidonation',
            icon: DiscordIcon,
        },
    ];

    return (
        <div className="min-h-screen py-12">
            <Head title="Support" />

            <div className="container">
                {/* Header */}
                <div className="text-center mb-8">
                    <Title level="1" className="text-3xl sm:text-4xl font-bold mb-4">
                        {t('support.title')}
                    </Title>
                    <p className="text-content-secondary text-lg">
                        {t('support.subtitle')}
                    </p>
                </div>

                {/* Social Handles */}
                <div className="bg-background border border-border-dark-on-dark rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-center">{t('support.connectWithUs')}</h2>
                    <div className="flex flex-wrap justify-center gap-6">
                        {socialHandles.map((social) => (
                            <a
                                key={social.name}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-4 py-3 bg-background rounded-lg hover:bg-background-tertiary transition-colors duration-200"
                            >
                                <social.icon className="text-primary" width={24} height={24} />
                                <div>
                                    <div className="text-sm font-medium">{social.name}</div>
                                    <div className="text-xs text-content-secondary">{social.handle}</div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-background border border-border-dark-on-dark rounded-2xl p-6 sm:py-8 sm:px-20 shadow-sm">
                    <h2 className="text-xl font-semibold mb-6 text-center">{t('support.sendMessage')}</h2>

                    {success && (
                        <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-800 border border-green-200">
                            {success}
                        </div>
                    )}

                    <form onSubmit={submit}>
                        <div className="mb-4">
                            <InputLabel htmlFor="name">
                                {t('support.name')}
                            </InputLabel>
                            <TextInput
                                id="name"
                                type="text"
                                placeholder={t('support.namePlaceholder')}
                                className="mt-1 w-full"
                                value={data.name}
                                required
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            <InputError message={errors?.name} className="mt-2" />
                        </div>

                        <div className="mb-4">
                            <InputLabel htmlFor="email">
                                {t('support.email')}
                            </InputLabel>
                            <TextInput
                                id="email"
                                type="email"
                                placeholder={t('support.emailPlaceholder')}
                                className="mt-1 w-full"
                                value={data.email}
                                required
                                autoComplete="email"
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors?.email} className="mt-2" />
                        </div>

                        <div className="mb-6">
                            <InputLabel htmlFor="message">
                                {t('support.message')}
                            </InputLabel>
                            <Textarea
                                id="message"
                                placeholder={t('support.messagePlaceholder')}
                                className="mt-1 min-h-[150px]"
                                value={data.message}
                                required
                                onChange={(e) => setData('message', e.target.value)}
                            />
                            <InputError message={errors?.message} className="mt-2" />
                        </div>

                        <PrimaryButton
                            className="w-full py-3 text-base"
                            disabled={processing}
                            type="submit"
                        >
                            {t('support.sendButton')}
                        </PrimaryButton>
                    </form>
                </div>
            </div>
        </div>
    );
}
