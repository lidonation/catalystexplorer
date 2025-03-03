import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import TextInput from '@/Components/atoms/TextInput';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ClaimProfileFormProps {
    profile: App.DataTransferObjects.IdeascaleProfileData;
    onVerificationCodeUpdate: (code: string) => void;
    onShowVerification: (value: boolean) => void
}

const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setData: any,
    data: any,
) => {
    setData(e.target.name as keyof typeof data, e.target.value);
};

const ClaimProfileForm = ({ profile, onVerificationCodeUpdate, onShowVerification }: ClaimProfileFormProps) => {
    const { t } = useTranslation();

    const { data, setData, processing, errors, reset } = useForm({
        name: profile?.name || '',
        email: profile?.email || '',
        bio: profile?.bio || '',
        ideascaleProfile: profile?.ideascale || '',
        twitter: profile?.twitter || '',
        discord: profile?.discord || '',
        linkedIn: profile?.linkedin || '',
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        try {
            const response = await axios.post(route('api.ideascaleProfiles.claim', {ideascaleProfile: profile?.hash}), data, {
                headers: {
                    'Content-Type': 'application/json', 
                },
            });

            onVerificationCodeUpdate(response?.data?.verificationCode)
            onShowVerification(true)
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="mt-4 mb-4 rounded-lg p-4 shadow-md">
            <form onSubmit={handleSubmit}>
                {/* Name */}
                <div className="mt-3">
                    <label htmlFor="name" className="text-sm">
                        {t('profileWorkflow.name')}
                    </label>
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        onChange={(e) => handleChange(e, setData, data)}
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
                        value={data.email}
                        onChange={(e) => handleChange(e, setData, data)}
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
                    <textarea
                        id="bio"
                        name="bio"
                        value={data.bio}
                        onChange={(e) => handleChange(e, setData, data)}
                        className="focus:ring-primary bg-background border-dark h-30 w-full rounded-lg border px-4 py-2 focus:ring-2"
                    />
                </div>

                {/* Social Links */}
                <div className="mt-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                            value={data.ideascaleProfile}
                            onChange={(e) => handleChange(e, setData, data)}
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
                            value={data.twitter}
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
                            value={data.discord}
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
                            value={data.linkedIn}
                            onChange={(e) => handleChange(e, setData, data)}
                            className="border-dark w-full"
                        />
                    </div>
                </div>

                {/* Claim Button */}
                <PrimaryButton className="mt-5 w-full cursor-pointer" disabled={processing}>
                    {processing
                        ? t('profileWorkflow.processing')
                        : t('profileWorkflow.claimProfile')}
                </PrimaryButton>
            </form>
        </div>
    );
};

export default ClaimProfileForm;
