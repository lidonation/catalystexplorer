import InputError from '@/Components/InputError';
import Checkbox from '@/Components/atoms/Checkbox';
import TextInput from '@/Components/atoms/TextInput';
import Textarea from '@/Components/atoms/Textarea';
import { FormDataConvertible } from '@inertiajs/core';
import { InertiaFormProps } from '@inertiajs/react';
import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';

export interface DrepSignupFormFields
    extends Record<string, FormDataConvertible> {
    name: string;
    email: string;
    bio: string;
    link: string;
    willMaintain: boolean;
}

interface DrepSignupFormProps {
    setIsValid: (valid: boolean) => void;
    form: InertiaFormProps<DrepSignupFormFields>;
}

export interface DrepSignupFormHandles {
    getFormData: InertiaFormProps<DrepSignupFormFields>;
}

const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setData: any,
    data: any,
) => {
    setData(e.target.name as keyof typeof data, e.target.value);
};

const DrepSignupForm = forwardRef<DrepSignupFormHandles, DrepSignupFormProps>(
    ({ setIsValid, form }, ref) => {
        const { data, setData } = form;

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
                            placeholder={t('name')}
                            value={form.data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full"
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
                            placeholder={t('email')}
                            value={form.data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full"
                            required
                        />
                        <InputError message={form.errors.email} />
                    </div>

                    {/* Bio */}
                    <div className="mt-3">
                        <label htmlFor="bio" className="text-sm">
                            {t('profileWorkflow.bio')}
                        </label>
                        <Textarea
                            id="bio"
                            name="bio"
                            required
                            minLengthEnforced
                            value={form.data.bio}
                            onChange={(e) => setData('bio', e.target.value)}
                            className="h-30 w-full rounded-lg px-4 py-2"
                        />
                        <InputError message={form.errors.bio} />
                    </div>

                    {/* link */}
                    <div>
                        <label htmlFor="link" className="text-sm">
                            {t('link')}
                        </label>
                        <TextInput
                            placeholder={t('link')}
                            id="link"
                            name="link"
                            value={form.data.link}
                            onChange={(e) => setData('link', e.target.value)}
                            className="w-full"
                        />
                        <InputError message={form.errors.ideascaleProfile} />
                    </div>

                    <div className="mt-3 flex items-center">
                        <Checkbox
                            name="willMaintain"
                            id="willMaintain"
                            checked={data.willMaintain}
                            onChange={(e) =>
                                setData('willMaintain', !data.willMaintain)
                            }
                            className="text-content-accent bg-background checked:bg-primary checked:hover:bg-primary focus:border-primary focus:ring-primary checked:focus:bg-primary mr-2 h-4 w-4 shadow-xs focus:border"
                        />
                        <label
                            htmlFor="willMaintain"
                            className={`text-sm ${!data.willMaintain && form.errors.willMaintain ? 'text-danger-strong' : 'text-slate'}`}
                        >
                            {t('workflows.catalystDrepSignup.willMaintain')}
                        </label>
                    </div>
                </form>
            </div>
        );
    },
);

export default DrepSignupForm;
