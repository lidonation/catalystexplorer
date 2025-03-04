import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/atoms/TextInput';
import Title from '@/Components/atoms/Title';
import LinkedInIcon from '@/Components/svgs/LinkedInIcons';
import WebIcon from '@/Components/svgs/WebIcon';
import XIcon from '@/Components/svgs/XIcon';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

interface UpdateSocialProfilesModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
    websiteUrl?: string;
}

export default function UpdateSocialProfilesModal({
    isOpen,
    onClose,
    title,
    linkedinUrl,
    twitterUrl,
    websiteUrl,
}: UpdateSocialProfilesModalProps) {
    const { t } = useTranslation();

    const { data, setData, patch, processing, errors, reset } = useForm({
        linkedin: linkedinUrl || '',
        twitter: twitterUrl || '',
        website: websiteUrl || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(generateLocalizedRoute('profile.update.socials'), {
            onSuccess: () => {
                onClose();
                reset('linkedin', 'twitter', 'website');
            },
            preserveScroll: true,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="bg-opacity-25 fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="bg-background mx-4 w-full max-w-md rounded-lg shadow-xl transition-colors duration-300 ease-in-out">
                <div className="flex items-center justify-between border-b border-gray-200 p-4 transition-colors duration-300 ease-in-out">
                    <Title level="5" className="text-content">
                        {title || t('updateSocialProfiles')}
                    </Title>
                    <button
                        onClick={onClose}
                        className="text-content-gray transition-colors duration-300 ease-in-out"
                    >
                        <span className="text-xl">×</span>
                    </button>
                </div>

                <form onSubmit={submit} className="p-4">
                    <div className="mb-4">
                        <InputLabel
                            htmlFor="linkedin"
                            className="text-content-gray mb-2 text-sm"
                        />
                        <div className="flex items-center">
                            <div className="mr-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#0077b5]">
                                <LinkedInIcon className="text-light-persist h-5 w-5" />
                            </div>
                            <TextInput
                                id="linkedin"
                                type="text"
                                name="linkedin"
                                value={data.linkedin}
                                onChange={(e) =>
                                    setData('linkedin', e.target.value)
                                }
                                className={`w-full px-3 py-2 ${errors.linkedin ? 'border-error' : ''}`}
                                placeholder="https://www.linkedin.com/company/lidonation/"
                            />
                        </div>
                        <InputError
                            message={errors.linkedin}
                            className="mt-2 ml-10"
                        />
                    </div>

                    <div className="mb-4">
                        <InputLabel
                            htmlFor="twitter"
                            className="text-content-gray mb-2 text-sm"
                        />
                        <div className="flex items-center">
                            <div className="bg-background mr-5 flex h-8 w-8 items-center justify-center rounded-sm border border-gray-200 transition-colors duration-300 ease-in-out">
                                <XIcon className="text-content h-5 w-5" />
                            </div>
                            <TextInput
                                id="twitter"
                                type="text"
                                name="twitter"
                                value={data.twitter}
                                onChange={(e) =>
                                    setData('twitter', e.target.value)
                                }
                                className={`w-full px-3 py-2 ${errors.twitter ? 'border-error' : ''}`}
                                placeholder="https://www.x.com/company/lidonation/"
                            />
                        </div>
                        <InputError
                            message={errors.twitter}
                            className="mt-2 ml-10"
                        />
                    </div>

                    <div className="mb-6">
                        <InputLabel
                            htmlFor="website"
                            className="text-content-gray mb-2 text-sm"
                        />
                        <div className="flex items-center">
                            <div className="border-accent bg-background mr-5 flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-300 ease-in-out">
                                <WebIcon className="text-accent h-5 w-5" />
                            </div>
                            <TextInput
                                id="website"
                                type="text"
                                name="website"
                                value={data.website}
                                onChange={(e) =>
                                    setData('website', e.target.value)
                                }
                                className={`w-full px-3 py-2 ${errors.website ? 'border-error' : ''}`}
                                placeholder="https://www.lidonation.com/"
                            />
                        </div>
                        <InputError
                            message={errors.website}
                            className="mt-2 ml-10"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-primary hover:bg-primary-dark w-full rounded-md px-4 py-2 text-white transition duration-200 disabled:opacity-75"
                    >
                        {processing ? t('loading') : t('update')}
                    </button>
                </form>
            </div>
        </div>
    );
}
