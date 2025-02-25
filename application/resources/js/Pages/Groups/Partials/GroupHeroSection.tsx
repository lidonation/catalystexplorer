import Image from '@/Components/Image';
import GroupData = App.DataTransferObjects.GroupData;

interface HeroSectionProps extends Record<string, unknown> {
    group: GroupData;
}

const GroupHeroSection: React.FC<HeroSectionProps> = ({ group }) => {
    return (
        <div className="bg-primary relative mx-auto flex h-40 w-full items-center justify-center rounded-xl">
            {/*<img*/}
            {/*    src={group?.hero_img_url}*/}
            {/*    alt={group?.name || 'Group'}*/}
            {/*    className="h-full w-full object-cover"*/}
            {/*/>*/}

            <div className="border-background-lighter absolute bottom-[-25px] left-1/2 -translate-x-1/2 transform rounded-full border-4">
                <Image size="30" imageUrl={group?.hero_img_url ?? group?.hero_img_url} />
            </div>
        </div>
    );
};

export default GroupHeroSection;
