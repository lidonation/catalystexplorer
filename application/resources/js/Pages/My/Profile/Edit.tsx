import Card from '@/Components/Card';
import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Switch from '@/Components/atoms/Switch';
import { formatTimeAgo } from '@/Components/layout/TimeFormatter';
import CheckIcon from '@/Components/svgs/CheckIcon';
import CopyIcon from '@/Components/svgs/CopyIcon';
import LinkedInIcon from '@/Components/svgs/LinkedInIcons';
import WebIcon from '@/Components/svgs/WebIcon';
import XIcon from '@/Components/svgs/XIcon';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { truncateMiddle } from '@/utils/truncateMiddle';
import { useForm } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, forwardRef, useImperativeHandle } from 'react';
import SocialProfilesForm from './Partials/EditSocialsForm';
import ProfileField from './Partials/ProfileField';
import ProfilePhotoUploader from './Partials/ProfilePhotoUploader';
import ProfileSection from './Partials/ProfileSection';
import PasswordForm from './Partials/UpdatePasswordForm';
import ProfileFieldForm from './Partials/UpdateProfileInformationForm';
import BaseModal from './Partials/UpdateProfilesModal';
import useProfileState, { ModalType } from './hooks/useProfileState';
import SecondaryLink from '@/Components/SecondaryLink';

export interface User {
    id: number;
    name: string;
    email: string;
    bio?: string;
    short_bio?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
    city?: string;
    updated_at?: string;
    created_at?: string;
    profile_photo_url?: string;
    password_updated_at?: string;
}

export interface ProfileSettingsProps {
    auth: {
        user: User;
    };
    user: User;
}

export interface ModalFieldConfig {
    title: string;
    fieldName: string;
    fieldLabel: string;
    currentValue: string;
    updateRoute: string;
    inputType?: string;
    placeholder?: string;
}

export interface SocialLinks {
    twitter: string;
    linkedin: string;
    website: string;
}

const generateSocialLinks = (user: User) => {
    return {
        twitter: user.twitter ? `https://x.com/${user.twitter}` : '',
        linkedin: user.linkedin
            ? `https://www.linkedin.com/in/${user.linkedin}`
            : '',
        website: user.website || '',
    };
};

const ProfileSettings = forwardRef<
    { openCityModal: () => void },
    ProfileSettingsProps
>(({ auth, user: directUser }, ref) => {
    const { t } = useLaravelReactI18n();
    const authUser = auth.user;
    const user = directUser || authUser;
    const socialLinks = generateSocialLinks(user);

    const {
        state,
        setIsPublic,
        openProfileFieldModal,
        openSocialProfilesModal,
        openPasswordModal,
        closeModal,
        setCopySuccess,
        setPhotoPreview,
        setPhotoUploading,
        setPhotoError,
    } = useProfileState();

    const { data, setData } = useForm({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        short_bio: user.short_bio || '',
        twitter: user.twitter || '',
        linkedin: user.linkedin || '',
        city: user.city || '',
        website: user.website || '',
        updated_at: user.updated_at || '',
        created_at: user.created_at || '',
        password_updated_at: user.password_updated_at || '',
    });

    useEffect(() => {
        if (user) {
            setData({
                name: user.name || '',
                email: user.email || '',
                bio: user.bio || '',
                short_bio: user.short_bio || '',
                twitter: user.twitter || '',
                linkedin: user.linkedin || '',
                city: user.city || '',
                website: user.website || '',
                updated_at: user.updated_at || '',
                created_at: user.created_at || '',
                password_updated_at: user.password_updated_at || '',
            });
        }
    }, [user, setData]);

    useImperativeHandle(ref, () => ({
        openCityModal: () => {
            openProfileFieldModal({
                title: user.city ? t('users.updateCity') : t('users.addCity'),
                fieldName: 'city',
                fieldLabel: t('users.city'),
                currentValue: user.city || data.city || '',
                updateRoute: 'profile.update.field',
                inputType: 'text',
            });
        },
    }));

    const handleCopyUrl = () => {
        const urlElement = document.querySelector('.profile-url-text');
        const url = urlElement ? urlElement.textContent : '';

        if (typeof url === 'string') {
            navigator.clipboard
                .writeText(url)
                .then(() => {
                    setCopySuccess(true);
                    setTimeout(() => {
                        setCopySuccess(false);
                    }, 2000);
                })
                .catch((err) => {
                    console.error('Failed to copy: ', err);
                });
        }
    };

    const handleFieldUpdated = (fieldName: string, value: string) => {
        setData((prev) => ({
            ...prev,
            [fieldName]: value,
        }));
    };

    const renderSocialIcon = (type: 'linkedin' | 'twitter' | 'website') => {
        const link = socialLinks[type];
        const Icon =
            type === 'linkedin'
                ? LinkedInIcon
                : type === 'twitter'
                  ? XIcon
                  : WebIcon;
        const title =
            type === 'linkedin'
                ? t('icons.titles.linkedIn')
                : type === 'twitter'
                  ? t('icons.titles.x')
                  : t('users.website');

        return (
            <div className="flex items-center space-x-2">
                <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={
                        link
                            ? 'cursor-pointer'
                            : 'pointer-events-none cursor-default'
                    }
                >
                    <Icon className="text-content" />
                </a>
                <Paragraph size="sm" className="text-content font-bold">
                    {link ? (
                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {title}
                        </a>
                    ) : (
                        title
                    )}
                </Paragraph>
            </div>
        );
    };

    // Render modals based on currentModal state
    const renderModals = () => {
        switch (state.currentModal) {
            case ModalType.PROFILE_FIELD:
                return (
                    <BaseModal
                        isOpen={true}
                        onClose={closeModal}
                        title={state.modalConfig.title}
                    >
                        <ProfileFieldForm
                            fieldName={state.modalConfig.fieldName}
                            fieldLabel={state.modalConfig.fieldLabel}
                            currentValue={state.modalConfig.currentValue}
                            updateRoute={state.modalConfig.updateRoute}
                            inputType={state.modalConfig.inputType}
                            placeholder={state.modalConfig.placeholder}
                            onClose={closeModal}
                            onFieldUpdated={handleFieldUpdated}
                        />
                    </BaseModal>
                );
            case ModalType.SOCIAL_PROFILES:
                return (
                    <BaseModal
                        isOpen={true}
                        onClose={closeModal}
                        title={t('users.updateSocialProfiles')}
                    >
                        <SocialProfilesForm
                            linkedinUrl={user.linkedin || ''}
                            twitterUrl={user.twitter || ''}
                            websiteUrl={user.website || ''}
                            onClose={closeModal}
                        />
                    </BaseModal>
                );
            case ModalType.PASSWORD:
                return (
                    <BaseModal
                        isOpen={true}
                        onClose={closeModal}
                        title={t('updatePassword')}
                    >
                        <PasswordForm onClose={closeModal} />
                    </BaseModal>
                );
            default:
                return null;
        }
    };

    return (
        <div className="mb-8">
            <div className="mx-auto max-w-6xl grid-cols-12 gap-3 text-left lg:grid">
                {/* Left column */}
                <div className="col-span-4 flex h-full flex-col justify-between">
                    <div className="space-y-3">
                        {/* About card */}
                        <Card className="bg-background rounded-lg shadow-sm">
                            <ProfileSection title={t('users.about')}>
                                <div className="py-4">
                                    {data.bio ? (
                                        <Paragraph
                                            size="sm"
                                            className="text-gray-persist"
                                        >
                                            {data.bio}
                                        </Paragraph>
                                    ) : (
                                        <Paragraph
                                            size="sm"
                                            className="text-gray-persist"
                                        >
                                            {t('users.noBiography')}
                                        </Paragraph>
                                    )}
                                </div>
                            </ProfileSection>
                        </Card>

                        {/* Network card */}
                        <Card className="bg-background rounded-lg shadow-sm">
                            <ProfileSection title={t('users.network')}>
                                <div className="space-y-4 py-4">
                                    {renderSocialIcon('linkedin')}
                                    {renderSocialIcon('twitter')}
                                    {renderSocialIcon('website')}
                                </div>
                            </ProfileSection>
                        </Card>

                        <PrimaryLink
                            className="lg:text-md mb-4 ml-auto w-full px-4 py-2 text-sm text-nowrap"
                            href={useLocalizedRoute(
                                'workflows.signature.index',
                                {
                                    step: 1,
                                },
                            )}
                        >
                            {`+ ${t('my.connectWallet')}`}
                        </PrimaryLink>
                    </div>

                    {/* Joined date */}
                    <Paragraph size="sm" className="text-content mt-4">
                        {user.created_at
                            ? `JOINED ${new Date(user.created_at)
                                  .toLocaleDateString('en-US', {
                                      month: 'long',
                                      day: 'numeric',
                                      year: 'numeric',
                                  })
                                  .toUpperCase()}`
                            : ''}
                    </Paragraph>
                </div>

                {/* Right column */}
                <div className="col-span-8">
                    {/* Personal Info Card */}
                    <Card className="bg-background mb-3 rounded-lg shadow-sm">
                        <ProfileSection title={t('users.personalInfo')}>
                            {/* Photo field */}
                            <div className="border-background-lighter flex items-center justify-between border-t">
                                <div className="flex w-full py-8">
                                    <div className="text-gray-persist w-1/4">
                                        {t('users.photo')}
                                    </div>
                                    <div className="w-3/4">
                                        <div className="text-dark text-sm">
                                            {t('users.photoSizeInstructions')}
                                        </div>
                                    </div>
                                </div>
                                <ProfilePhotoUploader
                                    photoPreview={state.photoPreview}
                                    profilePhotoUrl={user.profile_photo_url}
                                    photoUploading={state.photoUploading}
                                    photoError={state.photoError}
                                    setPhotoPreview={setPhotoPreview}
                                    setPhotoUploading={setPhotoUploading}
                                    setPhotoError={setPhotoError}
                                />
                            </div>

                            {/* Name field */}
                            <ProfileField
                                label={t('profileWorkflow.name')}
                                value={truncateMiddle(user.name)}
                                onEdit={() => {
                                    openProfileFieldModal({
                                        title: t('users.updateProfileName'),
                                        fieldName: 'name',
                                        fieldLabel: t('profileWorkflow.name'),
                                        currentValue: user.name,
                                        updateRoute: 'profile.update.field',
                                    });
                                }}
                            />

                            {/* Social Profiles field */}
                            <ProfileField
                                label={t('users.socialProfiles')}
                                value={
                                    <div className="flex space-x-2">
                                        <a
                                            href={socialLinks.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`bg-background-transparent ${socialLinks.linkedin ? 'cursor-pointer' : 'pointer-events-none cursor-default'}`}
                                        >
                                            <LinkedInIcon className="text-content h-7 w-7" />
                                        </a>
                                        <a
                                            href={socialLinks.twitter}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`bg-background-transparent ${socialLinks.twitter ? 'cursor-pointer' : 'pointer-events-none cursor-default'}`}
                                        >
                                            <XIcon className="text-content mr-1" />
                                        </a>
                                        <a
                                            href={socialLinks.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`bg-background-transparent ${socialLinks.website ? 'cursor-pointer' : 'pointer-events-none cursor-default'}`}
                                        >
                                            <WebIcon className="text-content" />
                                        </a>
                                    </div>
                                }
                                onEdit={openSocialProfilesModal}
                            />

                            {/* City field */}
                            <ProfileField
                                label={t('users.city')}
                                value={data.city ? data.city : undefined}
                                placeholder={t('users.noAddress')}
                                onEdit={() => {
                                    openProfileFieldModal({
                                        title: user.city
                                            ? t('users.updateCity')
                                            : t('users.addCity'),
                                        fieldName: 'city',
                                        fieldLabel: t('users.city'),
                                        currentValue:
                                            user.city || data.city || '',
                                        updateRoute: 'profile.update.field',
                                        inputType: 'text',
                                    });
                                }}
                                buttonText={
                                    user.city ? undefined : t('users.add')
                                }
                            />
                        </ProfileSection>
                    </Card>

                    {/* Basic Settings Card */}
                    <Card className="bg-background rounded-lg shadow-sm">
                        <ProfileSection
                            title={t('users.basicSettings')}
                            rightElement={
                                <div className="flex items-center">
                                    <span className="text-content mr-2 text-sm text-nowrap">
                                        {t('users.publicProfile')}
                                    </span>
                                    <Switch
                                        checked={state.isPublic}
                                        onCheckedChange={setIsPublic}
                                        size="sm"
                                    />
                                </div>
                            }
                        >
                            {/* Email field */}
                            <ProfileField
                                label={t('profileWorkflow.email')}
                                value={
                                    <span className="font-bold">
                                        {data.email}
                                    </span>
                                }
                                onEdit={() => {
                                    openProfileFieldModal({
                                        title: t('users.updateEmailAddress'),
                                        fieldName: 'email',
                                        fieldLabel: t('profileWorkflow.email'),
                                        currentValue: data.email,
                                        updateRoute: 'profile.update.field',
                                        inputType: 'email',
                                    });
                                }}
                            />

                            {/* Password field */}
                            <ProfileField
                                label={t('password')}
                                value={`Password last changed ${formatTimeAgo(user.password_updated_at)}`}
                                onEdit={openPasswordModal}
                            />

                            {/* Profile link field */}
                            <ProfileField
                                label={t('users.profileLink')}
                                value={
                                    <div className="flex items-center">
                                        <span className="profile-url-text text-content text-sm lg:text-base">
                                            {truncateMiddle(
                                                `https://catalytexplorer.com/${user.name.replace(/\s+/g, '-').toLowerCase()}`,
                                            )}
                                        </span>
                                        <Button
                                            className="text-content-light hover:text-content ml-2 text-sm transition-colors duration-300 ease-in-out"
                                            onClick={handleCopyUrl}
                                            ariaLabel="Copy URL"
                                        >
                                            {state.copySuccess ? (
                                                <span className="text-primary flex items-center">
                                                    <CheckIcon className="h-4 w-4" />
                                                </span>
                                            ) : (
                                                <CopyIcon className="text-content h-4 w-4" />
                                            )}
                                        </Button>
                                        {state.copySuccess && (
                                            <span className="text-primary ml-2 text-xs">
                                                {t('users.copied')}
                                            </span>
                                        )}
                                    </div>
                                }
                                onEdit={() => {
                                    // You could update this to handle re-creating the profile link
                                    // or keep the button as part of the value JSX above
                                }}
                                buttonText={t('users.recreate')}
                            />
                        </ProfileSection>
                    </Card>
                </div>
            </div>

            {renderModals()}
        </div>
    );
});

export default ProfileSettings;
