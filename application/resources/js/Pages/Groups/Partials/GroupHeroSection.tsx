import Image from '@/Components/Image';
import {useLaravelReactI18n} from "laravel-react-i18n";
import GroupData = App.DataTransferObjects.GroupData;

interface HeroSectionProps extends Record<string, unknown> {
    group: GroupData;
    children?: React.ReactNode;
}

const GroupHeroSection: React.FC<HeroSectionProps> = ({ group, children }) => {
    const { t } = useLaravelReactI18n();
    return (
        <div className="bg-primary relative mx-auto flex h-40 w-full items-center justify-center rounded-xl">
            {children}

            <div className="border-background-lighter absolute bottom-[-25px] left-1/2 -translate-x-1/2 transform rounded-full border-4">
                <Image
                    size="12"
                    className="h-24 w-24 rounded-full"
                    imageUrl={group?.hero_img_url ?? group?.hero_img_url}
                />
            </div>
        </div>
    );
};

export default GroupHeroSection;
