import Checkbox from '@/Components/atoms/Checkbox';
import Paragraph from '@/Components/atoms/Paragraph';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React from 'react';
import ProfileCard from './ProfileCard';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;

interface ProfileListProps {
    profiles: IdeascaleProfileData[];
    onProfileClick: (profileId: string | null) => void;
}

const ProfileList: React.FC<ProfileListProps> = ({
    profiles,
    onProfileClick,
}) => {
    const { t } = useLaravelReactI18n();

    if (!Array.isArray(profiles) || profiles?.length === 0) {
        return (
            <div className="rounded-lg border border-gray-200 p-4 text-center text-gray-600">
                <RecordsNotFound showIcon={true} />
                <Paragraph>{t('profileWorkflow.noProfilesFound')}</Paragraph>
            </div>
        );
    }

    return (
        <div className="mt-2 space-y-2 divide-y divide-gray-200">
            {profiles.map((profile, index) => (
                <div key={index} className="w-full">
                    <label
                        htmlFor={profile.id as string | undefined}
                        className="flex items-center hover:cursor-pointer"
                    >
                        <ProfileCard profile={profile} />
                        <Checkbox
                            name={profile.id as string | undefined}
                            id={profile.id as string | undefined}
                            onChange={() => onProfileClick(profile.id)}
                            className="text-content-accent bg-background checked:bg-primary checked:hover:bg-primary focus:border-primary focus:ring-primary checked:focus:bg-primary mr-2 h-4 w-4 shadow-xs focus:border"
                        />
                    </label>
                </div>
            ))}
        </div>
    );
};

export default ProfileList;
