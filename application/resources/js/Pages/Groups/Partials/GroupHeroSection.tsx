import UserAvatar from '@/Components/UserAvatar';
import GroupData = App.DataTransferObjects.GroupData;

interface HeroSectionProps extends Record<string, unknown> {
    group: GroupData;
}

const GroupHeroSection: React.FC<HeroSectionProps> = ({ group }) => {
    return (
        <div className="bg-primary relative mx-auto flex h-40 w-full items-center justify-center rounded-xl">
            <img
                src={group?.hero_img_url}
                alt={group?.name || 'Group'}
                className="h-full w-full object-cover"
            />

            {group?.profile_photo_url ? (
                <div className="border-background-lighter absolute bottom-[-25px] left-1/2 -translate-x-1/2 transform rounded-full border-4">
                    <UserAvatar imageUrl={group?.profile_photo_url} size="30" />
                </div>
            ) : (
                <div className="border-background-lighter bg-eye-logo absolute bottom-[-25px] left-1/2 z-99 size-30 -translate-x-1/2 transform rounded-full border-4"></div>
            )}
        </div>
    );
};

export default GroupHeroSection;
