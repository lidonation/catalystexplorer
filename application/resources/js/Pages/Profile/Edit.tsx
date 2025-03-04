import Card from '@/Components/Card';
import Paragraph from '@/Components/atoms/Paragraph';
import Switch from '@/Components/atoms/Switch';
import Title from '@/Components/atoms/Title';
import { formatTimeAgo } from '@/Components/layout/TimeFormatter';
import CameraIcon from '@/Components/svgs/CameraIcon';
import CheckIcon from '@/Components/svgs/CheckIcon';
import CopyIcon from '@/Components/svgs/CopyIcon';
import EditIcon from '@/Components/svgs/EditIcon';
import LinkedInIcon from '@/Components/svgs/LinkedInIcons';
import WebIcon from '@/Components/svgs/WebIcon';
import XIcon from '@/Components/svgs/XIcon';
import UpdatePasswordModal from '@/Pages/Profile/Partials/PasswordModal';
import UpdateProfileFieldModal from '@/Pages/Profile/Partials/UpdateProfileModal';
import UpdateSocialProfilesModal from '@/Pages/Profile/Partials/UpdateSocialProfiles';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { PageProps } from '@inertiajs/core';
import { router, useForm, usePage } from '@inertiajs/react';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface User {
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
    profile_photo_path?: string;
}

interface ModalConfig {
    isOpen: boolean;
    title: string;
    fieldName: string;
    fieldLabel: string;
    currentValue: string;
    updateRoute: string;
    inputType?: string;
    placeholder?: string;
}

interface ExtendedPageProps extends PageProps {
    user: User;
}

export default function ProfileSettings() {
    const { t } = useTranslation();
    const { user } = usePage<ExtendedPageProps>().props;

    const [isPublic, setIsPublic] = useState(true);
    const [modalConfig, setModalConfig] = useState<ModalConfig>({
        isOpen: false,
        title: '',
        fieldName: '',
        fieldLabel: '',
        currentValue: '',
        updateRoute: '',
        inputType: 'text',
        placeholder: '',
    });

    const [socialModalOpen, setSocialModalOpen] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [photoError, setPhotoError] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);

    const { data } = useForm({
        name: user.name,
        email: user.email,
        bio: user.bio ?? '',
        short_bio: user.short_bio ?? '',
        twitter: user.twitter ?? '',
        linkedin: user.linkedin ?? '',
        city: user.city ?? '',
        updated_at: user.updated_at ?? '',
        created_at: user.created_at ?? '',
    });

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

    const openModal = (config: Partial<ModalConfig>) => {
        setModalConfig((prev) => ({
            ...prev,
            ...config,
            isOpen: true,
        }));
    };

    const closeModal = () => {
        setModalConfig((prev) => ({
            ...prev,
            isOpen: false,
        }));
    };

    const validatePhoto = (file: File): string | null => {
        const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!acceptedTypes.includes(file.type)) {
            return 'File must be JPEG, PNG, or GIF';
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return 'File size must be less than 5MB';
        }

        return null;
    };

    const updateProfilePhoto = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        const error = validatePhoto(file);

        if (error) {
            setPhotoError(error);
            return;
        }

        setPhotoError('');

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result;
            if (typeof result === 'string') {
                setPhotoPreview(result);
            }
        };
        reader.readAsDataURL(file);

        setPhotoUploading(true);

        const formData = new FormData();
        formData.append('photo', file);

        router.post(generateLocalizedRoute('profile.photo.update'), formData, {
            forceFormData: true,
            onSuccess: () => {
                // Reset states
                setPhotoUploading(false);
                setPhotoPreview(null);
            },
            onError: (errors) => {
                setPhotoUploading(false);
                if (typeof errors === 'object' && errors !== null) {
                    const photoError = (errors as Record<string, string>)[
                        'photo'
                    ];
                    setPhotoError(photoError || 'Failed to upload photo');
                }
            },
        });
    };

    const removeProfilePhoto = () => {
        router.delete(generateLocalizedRoute('profile.photo.destroy'));
    };

    return (
        <div className="bg-background min-h-screen p-8 transition-colors duration-300 ease-in-out">
            <div className="mx-auto grid max-w-6xl grid-cols-12 gap-6">
                <div className="col-span-4 space-y-6">
                    <Card className="bg-background rounded-lg shadow-sm transition-colors duration-300 ease-in-out">
                        <div className="p-6">
                            <div className="mb-4 space-y-4">
                                <Title level="3" className="text-content pb-2">
                                    {t('users.about')}
                                </Title>
                                <div className="border-t border-gray-200 py-2">
                                    {data.bio ? (
                                        <Paragraph
                                            size="sm"
                                            className="text-content"
                                        >
                                            {data.bio}
                                        </Paragraph>
                                    ) : (
                                        <Paragraph
                                            size="sm"
                                            className="text-content-gray"
                                        >
                                            No biography available
                                        </Paragraph>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-background rounded-lg shadow-sm transition-colors duration-300 ease-in-out">
                        <div className="p-6">
                            <div className="mb-4">
                                <Title level="3" className="text-content">
                                    {t('users.network')}
                                </Title>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2 border-t border-gray-200">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full">
                                        <LinkedInIcon className="text-light-persist h-4 w-4" />
                                    </div>
                                    <Paragraph
                                        size="sm"
                                        className="text-content"
                                    >
                                        {t('icons.titles.linkedIn')}
                                    </Paragraph>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <XIcon className="text-black-persist bg-light-persist border-border-secondary h-6 w-6 rounded-sm border p-1 transition-colors duration-300 ease-in-out" />
                                    <Paragraph
                                        size="sm"
                                        className="text-content"
                                    >
                                        {t('icons.titles.x')}
                                    </Paragraph>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <WebIcon className="bg-light-persist border-accent text-accent h-6 w-6 rounded-full border p-1 transition-colors duration-300 ease-in-out" />
                                    <Paragraph
                                        size="sm"
                                        className="text-content"
                                    >
                                        {t('users.website')}
                                    </Paragraph>
                                </div>
                            </div>
                        </div>
                    </Card>
                    <Paragraph size="sm" className="text-content mt-4">
                        {user.created_at
                            ? `JOINED ${new Date(user.created_at)
                                  .toLocaleDateString('en-US', {
                                      month: 'long',
                                      day: 'numeric',
                                      year: 'numeric',
                                  })
                                  .toUpperCase()}`
                            : 'JOINED UNKNOWN'}
                    </Paragraph>
                </div>

                <div className="col-span-8 space-y-6">
                    <Card className="bg-background rounded-lg shadow-sm transition-colors duration-300 ease-in-out">
                        <div className="p-6">
                            <Title level="3" className="text-content mb-6">
                                {t('users.personalInfo')}
                            </Title>

                            <div>
                                <div className="border-t border-gray-200 py-4 transition-colors duration-300 ease-in-out">
                                    <div className="flex items-center justify-between">
                                        <div className="flex w-full">
                                            <div className="text-content w-1/4">
                                                {t('users.photo')}
                                            </div>
                                            <div className="w-3/4">
                                                <div className="text-sm text-gray-400">
                                                    {t(
                                                        'users.photoSizeInstructions',
                                                    )}
                                                </div>
                                                {photoError && (
                                                    <div className="text-error mb-2 text-sm">
                                                        {photoError}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <img
                                                src={
                                                    photoPreview ||
                                                    (user.profile_photo_path
                                                        ? `/storage/${user.profile_photo_path}`
                                                        : '/api/placeholder/150/150')
                                                }
                                                className={`border-border-secondary h-12 w-12 rounded-full border object-cover transition-colors duration-300 ease-in-out ${photoUploading ? 'opacity-50' : ''}`}
                                                alt="Profile"
                                            />
                                            {(user.profile_photo_path ||
                                                photoPreview) && (
                                                <button
                                                    onClick={removeProfilePhoto}
                                                    className="bg-background hover:bg-background-lighter absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border text-xs text-gray-400 shadow-sm transition-colors duration-300 ease-in-out"
                                                    disabled={photoUploading}
                                                >
                                                    ×
                                                </button>
                                            )}
                                            <label className="absolute right-3 bottom-0 cursor-pointer">
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={
                                                        updateProfilePhoto
                                                    }
                                                    accept="image/jpeg,image/png,image/gif"
                                                    disabled={photoUploading}
                                                />
                                                <div>
                                                    <CameraIcon className="text-content-light h-5 w-5" />
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 py-3 transition-colors duration-300 ease-in-out">
                                    <div className="flex items-center justify-between">
                                        <div className="flex w-full">
                                            <div className="text-content w-1/4">
                                                {t('profileWorkflow.name')}
                                            </div>
                                            <div className="text-content w-3/4">
                                                {data.name}
                                            </div>
                                        </div>
                                        <button
                                            className="text-primary"
                                            onClick={() => {
                                                openModal({
                                                    title: 'Update Profile Name',
                                                    fieldName: 'name',
                                                    fieldLabel: 'Name',
                                                    currentValue: data.name,
                                                    updateRoute:
                                                        'profile.update.field',
                                                });
                                            }}
                                        >
                                            <EditIcon className="text-primary" />
                                        </button>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 py-3 transition-colors duration-300 ease-in-out">
                                    <div className="flex items-center justify-between">
                                        <div className="flex w-full items-center">
                                            <div className="text-contentw-1/4">
                                                {t('users.socialProfiles')}
                                            </div>
                                            <div className="flex w-3/4 space-x-2">
                                                <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                                                    <LinkedInIcon className="text-primary h-5 w-5 rounded-full" />
                                                </div>
                                                <div className="bg-background-lighter flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300 ease-in-out">
                                                    <XIcon className="text-content h-5 w-5" />
                                                </div>
                                                <div className="bg-accent/10 flex h-8 w-8 items-center justify-center rounded-full">
                                                    <WebIcon className="text-accent h-5 w-5" />
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            className="text-primary"
                                            onClick={() =>
                                                setSocialModalOpen(true)
                                            }
                                        >
                                            <EditIcon className="text-primary" />
                                        </button>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 py-4 transition-colors duration-300 ease-in-out">
                                    <div className="flex items-center justify-between">
                                        <div className="flex w-full">
                                            <div className="text-content w-1/4">
                                                {t('users.city')}
                                            </div>
                                            <div className="text-content w-3/4">
                                                {data.city
                                                    ? data.city
                                                    : 'You have no an address yet'}
                                            </div>
                                        </div>
                                        <button
                                            className={
                                                data.city
                                                    ? 'text-primary'
                                                    : 'text-accent'
                                            }
                                            onClick={() => {
                                                openModal({
                                                    title: data.city
                                                        ? 'Update City'
                                                        : 'Add City',
                                                    fieldName: 'city',
                                                    fieldLabel: 'City',
                                                    currentValue:
                                                        data.city || '',
                                                    updateRoute:
                                                        'profile.update.field',
                                                });
                                            }}
                                        >
                                            {data.city ? (
                                                <EditIcon
                                                    className="text-primary"
                                                    width={20}
                                                    height={20}
                                                />
                                            ) : (
                                                'Add'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-background rounded-lg shadow-sm transition-colors duration-300 ease-in-out">
                        <div className="p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <Title level="3" className="text-content">
                                    {t('users.basicSettings')}
                                </Title>
                                <div className="flex items-center">
                                    <span className="text-content mr-2 text-sm">
                                        {t('users.publicProfile')}
                                    </span>
                                    <Switch
                                        checked={isPublic}
                                        onCheckedChange={setIsPublic}
                                        size="sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="border-t border-gray-200 py-3 transition-colors duration-300 ease-in-out">
                                    <div className="flex items-center justify-between">
                                        <div className="flex w-full">
                                            <div className="text-content w-1/4">
                                                {t('profileWorkflow.email')}
                                            </div>
                                            <div className="text-content w-3/4">
                                                {data.email}
                                            </div>
                                        </div>
                                        <button
                                            className="text-primary"
                                            onClick={() => {
                                                openModal({
                                                    title: 'Update Email Address',
                                                    fieldName: 'email',
                                                    fieldLabel: 'Email',
                                                    currentValue: data.email,
                                                    updateRoute:
                                                        'profile.update.field',
                                                    inputType: 'email',
                                                });
                                            }}
                                        >
                                            <EditIcon className="text-primary" />
                                        </button>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 py-3 transition-colors duration-300 ease-in-out">
                                    <div className="flex items-center justify-between">
                                        <div className="flex w-full">
                                            <div className="text-content w-1/4">
                                                {t('password')}
                                            </div>
                                            <div className="text-content w-3/4">
                                                Password last changed{' '}
                                                {formatTimeAgo(user.updated_at)}
                                            </div>
                                        </div>
                                        <button
                                            className="text-primary"
                                            onClick={() =>
                                                setPasswordModalOpen(true)
                                            }
                                        >
                                            <EditIcon className="text-primary" />
                                        </button>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 py-3 transition-colors duration-300 ease-in-out">
                                    <div className="flex items-center justify-between">
                                        <div className="flex w-full">
                                            <div className="text-content w-1/4">
                                                {t('users.profileLink')}
                                            </div>
                                            <div className="flex w-3/4 items-center">
                                                <span className="text-content profile-url-text">
                                                    {`https://catalytexplorer.com/${user.id}`}
                                                </span>
                                                <button
                                                    className="text-content-light hover:text-content ml-2 transition-colors duration-300 ease-in-out"
                                                    onClick={handleCopyUrl}
                                                    title="Copy URL"
                                                >
                                                    {copySuccess ? (
                                                        <span className="text-primary flex items-center">
                                                            <CheckIcon className="h-4 w-4" />
                                                        </span>
                                                    ) : (
                                                        <CopyIcon className="h-4 w-4" />
                                                    )}
                                                </button>
                                                {copySuccess && (
                                                    <span className="text-primary ml-2 text-xs">
                                                        Copied!
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button className="text-accent whitespace-nowrap">
                                            Re-create
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
            {modalConfig.isOpen && (
                <UpdateProfileFieldModal
                    isOpen={true}
                    onClose={closeModal}
                    title={modalConfig.title}
                    fieldName={modalConfig.fieldName}
                    fieldLabel={modalConfig.fieldLabel}
                    currentValue={modalConfig.currentValue}
                    updateRoute={modalConfig.updateRoute}
                    inputType={modalConfig.inputType}
                    placeholder={modalConfig.placeholder}
                />
            )}
            {socialModalOpen && (
                <UpdateSocialProfilesModal
                    isOpen={socialModalOpen}
                    onClose={() => setSocialModalOpen(false)}
                    title="Update Social Profiles"
                    linkedinUrl={user.linkedin || ''}
                    twitterUrl={user.twitter || ''}
                    websiteUrl={user.website || ''}
                />
            )}
            {passwordModalOpen && (
                <UpdatePasswordModal
                    isOpen={passwordModalOpen}
                    onClose={() => setPasswordModalOpen(false)}
                />
            )}
        </div>
    );
}
