import { FormEventHandler } from "react";
import { useForm, Link } from "@inertiajs/react";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";
import Checkbox from "@/Components/Checkbox";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import ConnectWalletIcon from "@/Components/svgs/ConnectWalletIcon";
import { useTranslation } from "react-i18next";



export default function LoginForm({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const { t } = useTranslation();
    return (
        <>
            {status && (
                <div className="mb-4 text-4 font-medium text-success">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col content-gap">
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex justify-between">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <p className="ms-2 text-4 text-dark">
                            {t("rememberMe")}
                        </p>
                    </label>
                    <div>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-4 text-primary font-bold hover:text-content focus:outline-none focus:ring-2 focus:border-x-border-secondary focus:ring-offset"
                            >
                                {t("forgotPassword")}
                            </Link>
                        )}
                    </div>
                </div>

                <div>
                    <PrimaryButton className="w-full h-10 flex items-center justify-center rounded-md" disabled={processing} type="submit">
                        {t("signin")}
                    </PrimaryButton>
                </div>

                <div>
                    <SecondaryButton className="w-full h-10 flex items-center justify-center rounded-md" icon={<ConnectWalletIcon/>} iconPosition="left">
                        {t("connectWallet")}
                    </SecondaryButton>
                </div>

                <div className="flex w-full items-center justify-center">
                    <p className="text-4 mr-2">{t("registration.noAccount")}</p>
                    <Link
                        href={route('login')}
                        className="text-4 text-primary font-bold hover:text-content focus:outline-none focus:ring-2 focus:ring-offset-2"
                    >
                        {t("signup")}
                    </Link>
                </div>
            </form>
        </>
    )
}