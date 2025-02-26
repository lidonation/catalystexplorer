import UserAvatar from '@/Components/UserAvatar';
import Paragraph from '@/Components/atoms/Paragraph';
import React from 'react';
import { useTranslation } from 'react-i18next';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;

interface ProfileCardProps {
    profile: IdeascaleProfileData;
    onSelect: () => void;
    children: React.ReactNode;
    className: string
}

const ProfileCard: React.FC<ProfileCardProps> = React.memo(
    ({ profile, children, onSelect, className }) => {
        const { t } = useTranslation();

        return (
            <div
                className={`hover:bg-darker flex w-full items-center justify-between p-1 transition ${className}`}
                onClick={onSelect}
            >
                <div className="flex flex-1 items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-gray-100 to-gray-900">
                        <UserAvatar
                            imageUrl={profile?.hero_img_url}
                            size="size-12"
                        />
                    </div>

                    <div className="min-w-0 flex-1">
                        <Paragraph className="truncate font-medium">
                            {profile?.name}
                        </Paragraph>
                        <Paragraph className="text-dark text-sm">
                            {t('profileWorkflow.proposalsCount', {
                                count: profile?.proposals_count ?? 0,
                            })}
                        </Paragraph>
                    </div>
                </div>

                {children}
            </div>
        );
    },
);

export default ProfileCard;
