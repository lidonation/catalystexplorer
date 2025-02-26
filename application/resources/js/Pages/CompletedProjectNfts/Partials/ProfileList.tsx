import Paragraph from '@/Components/atoms/Paragraph';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ProfileCard from './ProfileCard';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;

interface ProfileListProps {
    profiles: IdeascaleProfileData[];
    children?: (profile: IdeascaleProfileData) => React.ReactNode;
    onProfileClick: (profile: IdeascaleProfileData) => void;
}

const ProfileList: React.FC<ProfileListProps> = ({
    profiles,
    children,
    onProfileClick,
}) => {
    const { t } = useTranslation();

    if (!Array.isArray(profiles) || profiles?.length === 0) {
        return (
            <div className="rounded-lg border border-gray-200 p-4 text-center text-gray-600">
                <RecordsNotFound />
                <Paragraph>{t('profileWorkflow.noProfilesFound')}</Paragraph>
            </div>
        );
    }

    return (
        <div className="mt-2 space-y-2">
            {profiles.map((profile, index) => (
                <div
                    key={index}
                    className="w-full sm:max-w-[400px] lg:max-w-[500px]"
                >
                    <ProfileCard
                        profile={profile}
                        onSelect={() => onProfileClick(profile)}
                        className="cursor-pointer"
                    >
                        {children && children(profile)}
                    </ProfileCard>
                </div>
            ))}
        </div>
    );
};

export default ProfileList;
