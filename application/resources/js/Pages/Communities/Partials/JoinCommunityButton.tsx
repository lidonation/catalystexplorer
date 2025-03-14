import CommunitiesIcon from '@/Components/svgs/CommunitiesSvg';
import { router, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import CommunityData = App.DataTransferObjects.CommunityData;

interface JoinCommunityButtonProps {
    ideascale_profiles: IdeascaleProfileData[];
    community: CommunityData;
}

const JoinCommunityButton: React.FC<JoinCommunityButtonProps> = ({
    ideascale_profiles,
    community,
}) => {
    const { t } = useTranslation();
    const { auth } = usePage().props;

    const [hasJoined, setHasJoined] = useState(
        ideascale_profiles?.some(
            (profile) => profile?.claimedBy === auth?.user?.id,
        ),
    );

    const handleJoin = async () => {
        if (hasJoined || !auth?.user) return;
        router.post(
            route('api.community.join', { hash: community.hash }),
            {},
            {
                onSuccess: () => setHasJoined(true),
                onError: (errors) => console.error(errors),
            },
        );
    };

    return (
        <>
            <button
                onClick={handleJoin}
                disabled={hasJoined}
                className={`flex flex-row items-center gap-2 rounded-md px-4 py-2 font-medium transition ${
                    hasJoined
                        ? 'bg-background border-content-light border border-1'
                        : 'bg-primary text-background cursor-pointer'
                }`}
            >
                {hasJoined ? (
                    ''
                ) : (
                    <CommunitiesIcon className="text-background h-4 w-4" />
                )}
                {hasJoined ? 'Joined' : 'Join'}
            </button>
        </>
    );
};

export default JoinCommunityButton;
