import InputError from '@/Components/InputError';
import TextInput from '@/Components/atoms/TextInput';
import { FormDataConvertible } from '@inertiajs/core';
import { InertiaFormProps } from '@inertiajs/react';
import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';

export interface FormFields extends Record<string, FormDataConvertible> {
    name: string;
    email: string;
    bio: string | any[];
    ideascaleProfile: string;
    twitter: string;
    discord: string;
    linkedIn: string;
}

interface ClaimProfileFormProps {
    setIsValid: (valid: boolean) => void;
    form: InertiaFormProps<FormFields>;
}

export interface ClaimFormHandles {
    getFormData: InertiaFormProps<FormFields>;
}

const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setData: any,
    data: any,
) => {
    setData(e.target.name as keyof typeof data, e.target.value);
};

const ClaimProfileForm = forwardRef<ClaimFormHandles, ClaimProfileFormProps>(
    ({ setIsValid, form }, ref) => {
        const { data, setData, errors } = form;

        const { t } = useTranslation();

        useImperativeHandle(ref, () => ({
            getFormData: form,
        }));

        useEffect(() => {
            if (form.data.email.length && form.data.name.length) {
                setIsValid(true);
            }
        }, [form.data.email, form.data.name]);

        return (
            <div className="mt-4 mb-4 rounded-lg p-4 shadow-md lg:p-8">
                <form>
                    {/* Name */}
                    <div className="mt-3">
                        <label htmlFor="name" className="text-sm">
                            {t('profileWorkflow.name')}
                        </label>
                        <TextInput
                            id="name"
                            name="name"
                            value={form.data.name}
                            onChange={(e) => handleChange(e, setData, data)}
                            className="border-dark w-full"
                            required
                        />
                        <InputError message={form.errors.name} />
                    </div>

                    {/* Email */}
                    <div className="mt-3">
                        <label htmlFor="email" className="text-sm">
                            {t('profileWorkflow.email')}
                        </label>
                        <TextInput
                            id="email"
                            name="email"
                            type="email"
                            value={form.data.email}
                            onChange={(e) => handleChange(e, setData, data)}
                            className="border-dark w-full"
                            required
                        />
                        <InputError message={form.errors.email} />
                    </div>

                    {/* Bio */}
                    <div className="mt-3">
                        <label htmlFor="bio" className="text-sm">
                            {t('profileWorkflow.bio')}
                        </label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={form.data.bio}
                            onChange={(e) => handleChange(e, setData, data)}
                            className="focus:ring-primary bg-background border-dark h-30 w-full rounded-lg border px-4 py-2 focus:ring-2"
                        />
                    </div>

                    {/* Social Links */}
                    <div className="mt-2 grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div>
                            <label
                                htmlFor="ideascaleProfile"
                                className="text-sm"
                            >
                                {t('profileWorkflow.ideascaleProfile')}{' '}
                                <span className="text-dark">
                                    {t('profileWorkflow.profileLink')}
                                </span>
                            </label>
                            <TextInput
                                id="ideascaleProfile"
                                name="ideascaleProfile"
                                value={form.data.ideascaleProfile}
                                onChange={(e) => handleChange(e, setData, data)}
                                className="border-dark w-full"
                            />
                            <InputError
                                message={form.errors.ideascaleProfile}
                            />
                        </div>
                        <div>
                            <label htmlFor="twitter" className="text-sm">
                                {t('profileWorkflow.twitter')}{' '}
                                <span className="text-dark">
                                    {t('profileWorkflow.twitterHandle')}
                                </span>
                            </label>
                            <TextInput
                                id="twitter"
                                name="twitter"
                                value={form.data.twitter}
                                onChange={(e) => handleChange(e, setData, data)}
                                className="border-dark w-full"
                            />
                        </div>
                        <div>
                            <label htmlFor="discord" className="text-sm">
                                {t('profileWorkflow.discord')}{' '}
                                <span className="text-dark">
                                    {t('profileWorkflow.discordUsername')}
                                </span>
                            </label>
                            <TextInput
                                id="discord"
                                name="discord"
                                value={form.data.discord}
                                onChange={(e) => handleChange(e, setData, data)}
                                className="border-dark w-full"
                            />
                        </div>
                        <div>
                            <label htmlFor="linkedIn" className="text-sm">
                                {t('profileWorkflow.linkedIn')}{' '}
                                <span className="text-dark">
                                    {t('profileWorkflow.profileLink')}
                                </span>
                            </label>
                            <TextInput
                                id="linkedIn"
                                name="linkedIn"
                                value={form.data.linkedIn}
                                onChange={(e) => handleChange(e, setData, data)}
                                className="border-dark w-full"
                            />
                        </div>
                    </div>

                    {/* Claim Button */}
                    {/* <PrimaryButton className="mt-5 w-full cursor-pointer" disabled={processing}>
                    {processing
                        ? t('profileWorkflow.processing')
                        : t('profileWorkflow.claimProfile')}
                </PrimaryButton> */}
                </form>
            </div>
        );
    },
);

export default ClaimProfileForm;
