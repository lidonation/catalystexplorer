import Image from '@/Components/Image';
import GroupData = App.DataTransferObjects.GroupData;
import Button from '@/Components/atoms/Button';

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
            <Button className="absolute top-2 right-2 bg-success text-white py-1 px-3 rounded">
                Manage Group
            </Button>

            <div className="border-background-lighter absolute bottom-[-25px] left-1/2 -translate-x-1/2 transform rounded-full border-4">
                <Image size="12" className='h-24 w-24 rounded-full' imageUrl={group?.hero_img_url ?? group?.hero_img_url} />
            </div>
        </div>
    );
};

export default GroupHeroSection;
