import Paragraph from '@/Components/atoms/Paragraph';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../../types/paginated-data'; // Added import for Paragraph component
import ProfileCard from './ProfileCard';
import Paginator from '@/Components/Paginator';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;

interface ProfileListProps {
    profiles: PaginatedData<IdeascaleProfileData[]>;
    children?: (profile: IdeascaleProfileData) => React.ReactNode;
    onProfileClick: (profile: IdeascaleProfileData) => void;
}

const ProfileList: React.FC<ProfileListProps> = ({
    profiles,
    children,
    onProfileClick,
}) => {
    const { t } = useTranslation();

    if (!Array.isArray(profiles?.data) || profiles?.data?.length === 0) {
        return (
            <div className="rounded-lg border border-gray-200 p-4 text-center text-red-600">
                <RecordsNotFound />
                <Paragraph>{t('profileWorkflow.noProfilesFound')}</Paragraph>
            </div>
        );
    }

    return (
        <div>
            <div className="mt-2 space-y-2">
                {profiles.data.map((profile, index) => (
                    <div
                        key={index}
                        className="w-full sm:max-w-[400px] lg:max-w-[500px]"
                    >
                        <ProfileCard
                            profile={profile}
                            onSelect={() => onProfileClick(profile)}
                            className='cursor-pointer'
                        >
                            {children && children(profile)}
                        </ProfileCard>
                    </div>
                ))}
            </div>
            <div className="mt-6 flex w-full items-center justify-between overflow-x-auto">
                {profiles && (
                    <Paginator
                        pagination={profiles}
                        linkProps={{
                            preserveScroll: true,
                            preserveState: true,
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default ProfileList;
