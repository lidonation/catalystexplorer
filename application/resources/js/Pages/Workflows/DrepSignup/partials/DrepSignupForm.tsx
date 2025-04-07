import InputError from '@/Components/InputError';
import TextInput from '@/Components/atoms/TextInput';
import { FormDataConvertible } from '@inertiajs/core';
import { InertiaFormProps } from '@inertiajs/react';
import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';

export interface DrepSignupFormFields extends Record<string, FormDataConvertible> {
    name: string;
    email: string;
    bio: string;
    link: string;
}

interface ClaimProfileFormProps {
    setIsValid: (valid: boolean) => void;
    form: InertiaFormProps<DrepSignupFormFields>;
}

export interface ClaimFormHandles {
    getFormData: InertiaFormProps<DrepSignupFormFields>;
}

const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setData: any,
    data: any,
) => {
    setData(e.target.name as keyof typeof data, e.target.value);
};

const DrepSignupForm = forwardRef<ClaimFormHandles, ClaimProfileFormProps>(
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
            <div className="rounded-lg p-4 lg:p-8">
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

                    <div>
                        <label htmlFor="ideascaleProfile" className="text-sm">
                            {t('profileWorkflow.ideascaleProfile')}{' '}
                            <span className="text-dark">
                                {t('profileWorkflow.profileLink')}
                            </span>
                        </label>
                        <TextInput
                            id="ideascaleProfile"
                            name="ideascaleProfile"
                            value={form.data.link}
                            onChange={(e) => handleChange(e, setData, data)}
                            className="border-dark w-full"
                        />
                        <InputError message={form.errors.ideascaleProfile} />
                    </div>

                </form>
            </div>
        );
    },
);

export default DrepSignupForm;
