import InputError from '@/Components/InputError';
import TextInput from '@/Components/atoms/TextInput';
import Textarea from '@/Components/atoms/Textarea';
import { FormDataConvertible } from '@inertiajs/core';
import { InertiaFormProps } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { forwardRef, useEffect, useImperativeHandle } from 'react';

export interface IdeascaleProfileFormFields
    extends Record<string, FormDataConvertible> {
    name: string;
    email: string;
    bio: string;
    ideascaleProfile: string;
    twitter: string;
    discord: string;
    linkedIn: string;
}

interface ClaimProfileFormProps {
    setIsValid: (valid: boolean) => void;
    form: InertiaFormProps<IdeascaleProfileFormFields>;
}

export interface ClaimFormHandles {
    getFormData: InertiaFormProps<IdeascaleProfileFormFields>;
}

const ClaimProfileForm = forwardRef<ClaimFormHandles, ClaimProfileFormProps>(
    ({ setIsValid, form }, ref) => {
        const typedForm = form as InertiaFormProps<IdeascaleProfileFormFields>;
        const { data } = typedForm;
        const setData = typedForm.setData as (
            field: keyof IdeascaleProfileFormFields,
            value: any,
        ) => void;
        const errors = typedForm.errors as Partial<
            Record<keyof IdeascaleProfileFormFields, string>
        >;

        const { t } = useLaravelReactI18n();

        useImperativeHandle(ref, () => ({
            getFormData: form,
        }));

        useEffect(() => {
            if (typedForm.data.email.length && typedForm.data.name.length) {
                setIsValid(true);
            }
        }, [typedForm.data.email, typedForm.data.name]);

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
                            value={typedForm.data.name}
                            onChange={(e) => {
                                e.preventDefault;
                                setData('name', e.target.value);
                            }}
                            className="border-dark w-full"
                            required
                        />
                        <InputError message={errors.name} />
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
                            value={typedForm.data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="border-dark w-full"
                            required
                        />
                        <InputError message={errors.email} />
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
                            value={typedForm.data.bio}
                            onChange={(e) => setData('bio', e.target.value)}
                            className="h-30 w-full rounded-lg px-4 py-2"
                        />
                        <InputError message={errors.bio} />
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
                                value={typedForm.data.ideascaleProfile}
                                onChange={(e) =>
                                    setData('ideascaleProfile', e.target.value)
                                }
                                className="border-dark w-full"
                            />
                            <InputError message={errors.ideascaleProfile} />
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
                                value={typedForm.data.twitter}
                                onChange={(e) =>
                                    setData('twitter', e.target.value)
                                }
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
                                value={typedForm.data.discord}
                                onChange={(e) =>
                                    setData('discord', e.target.value)
                                }
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
                                value={typedForm.data.linkedIn}
                                onChange={(e) =>
                                    setData('linkedIn', e.target.value)
                                }
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
