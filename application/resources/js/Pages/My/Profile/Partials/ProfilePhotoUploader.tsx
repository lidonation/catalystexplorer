import CameraIcon from '@/Components/svgs/CameraIcon';
import { ChangeEvent } from 'react';
import { router } from '@inertiajs/react';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import {useLaravelReactI18n} from "laravel-react-i18n";

interface ProfilePhotoUploaderProps {
  photoPreview: string | null;
  profilePhotoUrl: string | undefined;
  photoUploading: boolean;
  photoError: string;
  setPhotoPreview: (value: string | null) => void;
  setPhotoUploading: (value: boolean) => void;
  setPhotoError: (value: string) => void;
}

export default function ProfilePhotoUploader({
  photoPreview,
  profilePhotoUrl,
  photoUploading,
  photoError,
  setPhotoPreview,
  setPhotoUploading,
  setPhotoError
}: ProfilePhotoUploaderProps) {

  const { t } = useLaravelReactI18n();

  const validatePhoto = (file: File): string | null => {
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!acceptedTypes.includes(file.type)) {
      return t('users.photoErrors.invalidType');
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return t('users.photoErrors.tooLarge');
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
        setPhotoUploading(false);
        setPhotoPreview(null);
        router.reload({ only: ['user'] });
      },
      onError: (errors) => {
        setPhotoUploading(false);
        if (typeof errors === 'object' && errors !== null) {
          const photoError = (errors as Record<string, string>)['photo'];
          setPhotoError(photoError || 'Failed to upload photo');
        }
      },
    });
  };

  const removeProfilePhoto = () => {
    router.delete(generateLocalizedRoute('profile.photo.destroy'), {
      onSuccess: () => {
        router.reload({ only: ['user'] });
      },
    });
  };

  return (
    <div className="relative">
      <img
        src={
          photoPreview ||
          (profilePhotoUrl
            ? profilePhotoUrl
            : '/api/placeholder/150/150')
        }
        className={`border-border-secondary h-11 w-12 rounded-full border object-cover transition-colors duration-300 ease-in-out ${photoUploading ? 'opacity-50' : ''}`}
        alt="Profile"
      />
      {(profilePhotoUrl || photoPreview) && (
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
          onChange={updateProfilePhoto}
          accept="image/jpeg,image/png,image/gif"
          disabled={photoUploading}
        />
        <div>
          <CameraIcon className="text-content-light h-5 w-5" />
        </div>
      </label>
      {photoError && (
        <div className="text-error mt-2 text-sm">
          {photoError}
        </div>
      )}
    </div>
  );
}
