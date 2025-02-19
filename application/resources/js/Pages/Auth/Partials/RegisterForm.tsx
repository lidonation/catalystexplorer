import { Link, router, useForm } from "@inertiajs/react";
import InputLabel from "../../../Components/InputLabel";
import TextInput from "../../../Components/atoms/TextInput";
import InputError from "../../../Components/InputError";
import PrimaryButton from "../../../Components/atoms/PrimaryButton";
import { useTranslation } from "react-i18next";
import { FormEventHandler, useState } from "react";
import axios from "axios";
import {useLocalizedRoute} from "@/utils/localizedRoute";

interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
    password_confirmation?: string;
}


export default function RegisterForm() {
    const { data, setData, processing,post, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
            onSuccess: () => router.visit(useLocalizedRoute('my.dashboard')),
        })
    };


    const { t } = useTranslation();

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
                <InputLabel htmlFor="email" value={t("email")} />

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
                <InputLabel htmlFor="password" value={t("password")} />

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
                <p className="text-4 text-dark mt-1">{t("registration.passwordCharacters")}</p>
                <InputError message={errors?.password} className="mt-2" />
            </div>

            <div>
                <InputLabel
                    htmlFor="password_confirmation"
                    value={t("confirmPassword")}
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

                <InputError message={errors?.password_confirmation} className="mt-2" />
            </div>

            <div>
                <PrimaryButton className="w-full h-10 flex items-center justify-center rounded-md" disabled={processing} type="submit">
                    {t("getStarted")}
                </PrimaryButton>
            </div>

            <div className="flex w-full items-center justify-center">
                <p className="mr-2">{t("registration.alreadyRegistered")}</p>
                <Link
                    href={route('login')}
                    className="text-primary hover:text-content rounded-md font-bold focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
                >
                    {t("login")}
                </Link>
            </div>
        </form>
    )
}
