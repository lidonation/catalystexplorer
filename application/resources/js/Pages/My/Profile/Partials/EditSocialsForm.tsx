import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import ErrorDisplay from '@/Components/atoms/ErrorDisplay';
import TextInput from '@/Components/atoms/TextInput';
import LinkedInIcon from '@/Components/svgs/LinkedInIcons';
import WebIcon from '@/Components/svgs/WebIcon';
import XIcon from '@/Components/svgs/XIcon';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { useForm } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { FormEventHandler } from 'react';

interface SocialProfilesFormProps {
    linkedinUrl?: string;
    twitterUrl?: string;
    websiteUrl?: string;
    onClose: () => void;
}

export default function SocialProfilesForm({
    linkedinUrl,
    twitterUrl,
    websiteUrl,
    onClose,
}: SocialProfilesFormProps) {
    const { t } = useLaravelReactI18n();

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

    return (
        <form onSubmit={submit} className="p-4">
            <ErrorDisplay />

            <div className="mb-4">
                <InputLabel
                    htmlFor="linkedin"
                    className="text-content-gray mb-2 text-sm"
                />
                <div className="flex items-center">
                    <div className="mr-5 flex h-8 w-8 items-center justify-center rounded-sm">
                        <LinkedInIcon className="text-content" />
                    </div>
                    <TextInput
                        id="linkedin"
                        type="text"
                        name="linkedin"
                        value={data.linkedin}
                        onChange={(e) => setData('linkedin', e.target.value)}
                        className={`w-full px-3 py-2 ${errors.linkedin ? 'border-error' : ''}`}
                        placeholder="https://www.linkedin.com/company/lidonation/"
                    />
                </div>
                <InputError message={errors.linkedin} className="mt-2 ml-10" />
            </div>

            <div className="mb-4">
                <InputLabel
                    htmlFor="twitter"
                    className="text-content-gray mb-2 text-sm"
                />
                <div className="flex items-center">
                    <div className="bg-background mr-5 flex h-8 w-8 items-center justify-center rounded-sm">
                        <XIcon className="text-content" />
                    </div>
                    <TextInput
                        id="twitter"
                        type="text"
                        name="twitter"
                        value={data.twitter}
                        onChange={(e) => setData('twitter', e.target.value)}
                        className={`w-full px-3 py-2 ${errors.twitter ? 'border-error' : ''}`}
                        placeholder="https://www.x.com/company/lidonation/"
                    />
                </div>
                <InputError message={errors.twitter} className="mt-2 ml-10" />
            </div>

            <div className="mb-6">
                <InputLabel
                    htmlFor="website"
                    className="text-content-gray mb-2 text-sm"
                />
                <div className="flex items-center">
                    <div className="border-accent bg-background mr-5 flex h-8 w-8 items-center justify-center rounded-full">
                        <WebIcon className="text-content" />
                    </div>
                    <TextInput
                        id="website"
                        type="text"
                        name="website"
                        value={data.website}
                        onChange={(e) => setData('website', e.target.value)}
                        className={`w-full px-3 py-2 ${errors.website ? 'border-error' : ''}`}
                        placeholder="https://www.lidonation.com/"
                    />
                </div>
                <InputError message={errors.website} className="mt-2 ml-10" />
            </div>

            <button
                type="submit"
                disabled={processing}
                className="bg-primary hover:bg-primary-dark w-full rounded-md px-4 py-2 text-white transition duration-200 disabled:opacity-75"
            >
                {processing ? t('loading') : t('update')}
            </button>
        </form>
    );
}
