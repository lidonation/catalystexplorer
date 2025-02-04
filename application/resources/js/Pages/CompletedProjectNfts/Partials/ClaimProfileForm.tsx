import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface Profile {
    name: string;
    email?: string;
    bio?: string;
    ideascaleProfile?: string;
    twitter?: string;
    discord?: string;
    linkedIn?: string;
    status?: string;
}

interface ClaimProfileFormProps {
    profile: Profile;
    onClaim: (profile: Profile) => void;
}

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, setData: any, data: any) => {
    setData(e.target.name as keyof typeof data, e.target.value);
};

const ClaimProfileForm = ({ profile, onClaim }: ClaimProfileFormProps) => {
    const { t } = useTranslation();

    const { data, setData, processing, errors, reset } = useForm({
        name: profile.name || '',
        email: '',
        bio: '',
        ideascaleProfile: '',
        twitter: '',
        discord: '',
        linkedIn: '',
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        console.log("Submitting:", data);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        setTimeout(() => {
            onClaim({ ...profile, ...data, status: 'claimed' });
            reset('name', 'email', 'bio', 'ideascaleProfile', 'twitter', 'discord', 'linkedIn');
        }, 1000);
    };

    return (
        <div className="p-4 mt-2 border rounded-lg shadow-sm border-dark">
            <form onSubmit={handleSubmit}>
                {/* Name */}
                <div className="mt-3">
                    <label htmlFor="name" className="text-sm">{t("profileWorkflow.name")}</label>
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        onChange={(e) => handleChange(e, setData, data)}
                        className="w-full border-dark"
                        required
                    />
                    <InputError message={errors.name} />
                </div>

                {/* Email */}
                <div className="mt-3">
                    <label htmlFor="email" className="text-sm">{t("profileWorkflow.email")}</label>
                    <TextInput
                        id="email"
                        name="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => handleChange(e, setData, data)}
                        className="w-full border-dark"
                        required
                    />
                    <InputError message={errors.email} />
                </div>

                {/* Bio */}
                <div className="mt-3">
                    <label htmlFor="bio" className="text-sm">{t("profileWorkflow.bio")}</label>
                    <textarea
                        id="bio"
                        name="bio"
                        value={data.bio}
                        onChange={(e) => handleChange(e, setData, data)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary bg-background border-dark"
                    />
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                        <label htmlFor="ideascaleProfile" className="text-sm">
                            {t("profileWorkflow.ideascaleProfile")} <span className="text-dark">{t("profileWorkflow.profileLink")}</span>
                        </label>
                        <TextInput
                            id="ideascaleProfile"
                            name="ideascaleProfile"
                            value={data.ideascaleProfile}
                            onChange={(e) => handleChange(e, setData, data)}
                            className="w-full border-dark"
                            required
                        />
                        <InputError message={errors.ideascaleProfile} />
                    </div>
                    <div>
                        <label htmlFor="twitter" className="text-sm">
                            {t("profileWorkflow.twitter")} <span className="text-dark">{t("profileWorkflow.twitterHandle")}</span>
                        </label>
                        <TextInput
                            id="twitter"
                            name="twitter"
                            value={data.twitter}
                            onChange={(e) => handleChange(e, setData, data)}
                            className="w-full border-dark"
                        />
                    </div>
                    <div>
                        <label htmlFor="discord" className="text-sm">
                            {t("profileWorkflow.discord")} <span className="text-dark">{t("profileWorkflow.discordUsername")}</span>
                        </label>
                        <TextInput
                            id="discord"
                            name="discord"
                            value={data.discord}
                            onChange={(e) => handleChange(e, setData, data)}
                            className="w-full border-dark"
                        />
                    </div>
                    <div>
                        <label htmlFor="linkedIn" className="text-sm">
                            {t("profileWorkflow.linkedIn")} <span className="text-dark">{t("profileWorkflow.profileLink")}</span>
                        </label>
                        <TextInput
                            id="linkedIn"
                            name="linkedIn"
                            value={data.linkedIn}
                            onChange={(e) => handleChange(e, setData, data)}
                            className="w-full border-dark"
                        />
                    </div>
                </div>

                {/* Claim Button */}
                <PrimaryButton className="w-full mt-5" disabled={processing}>
                    {processing ? t("profileWorkflow.processing") : t("profileWorkflow.claimProfile")}
                </PrimaryButton>
            </form>
        </div>
    );
};

export default ClaimProfileForm;
