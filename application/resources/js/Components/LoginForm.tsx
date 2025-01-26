import { FormEventHandler, useState } from "react";
import { useForm, Link, router } from "@inertiajs/react";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";
import Checkbox from "@/Components/Checkbox";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import ConnectWalletIcon from "@/Components/svgs/ConnectWalletIcon";
import { useTranslation } from 'react-i18next';

interface LoginFormProps {
  title?: string;
}

export default function LoginForm({ title }: LoginFormProps) {
    const { t } = useTranslation();

    return (
        <div className="flex items-center justify-center py-12">
            <div className="mx-4 w-full max-w-md rounded-2xl bg-background p-6 shadow-md sm:mx-0 sm:p-8">
                {/* Conditionally render the title only if it's provided */}
                {title && (
                  <h2 className="text-center text-2xl font-bold sm:text-3xl">
                    {title}
                  </h2>
                )}

                <div className="mt-2 text-center">
                    <p className="text-xs sm:text-sm">{t('loginPrompt')}</p>
                </div>

                <div className="flex justify-center mt-4">
                    <SecondaryButton
                        className="hover:bg-background-lighter flex gap-2 py-1.5 px-4 text-sm sm:text-base rounded-md"
                        icon={<ConnectWalletIcon className="bg-background"/>}
                        iconPosition="left"
                        type="submit"
                    >
                        {t("connectWallet")}
                    </SecondaryButton>
                </div>

                <div className="py-4"></div>

                <form>
                    <div className="mb-4">
                        <InputLabel htmlFor="email">
                            {t('emailAddress')}
                        </InputLabel>
                        <TextInput
                            id="email"
                            type="email"
                            placeholder="Email"
                            className="mt-1 w-full"
                            required
                        />
                        <InputError />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="password">
                            {t('password')}
                        </InputLabel>
                        <TextInput
                            id="password"
                            type="password"
                            placeholder="Password"
                            className="mt-1 w-full"
                            required
                        />
                        <InputError />
                    </div>

                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Checkbox id="remember-me" className="h-4 w-4 rounded text-primary" />
                            <label htmlFor="remember-me" className="text-sm">
                                {t('rememberMe')}
                            </label>
                        </div>
                        <Link href="#" className="text-xs text-primary hover:underline sm:text-sm">
                            {t('forgotPassword')}
                        </Link>
                    </div>

                    <PrimaryButton className="w-full py-3">
                        {t('signin')}
                    </PrimaryButton>
                </form>

                <p className="mt-4 text-center text-xs text-dark sm:text-sm">
                    {t('registration.noAccount')}{' '}
                    <Link href="#" className="font-medium text-primary hover:underline">
                        {t('signup')}
                    </Link>
                </p>
            </div>
        </div>
    );
}
