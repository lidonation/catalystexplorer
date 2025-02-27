import { useTranslation } from 'react-i18next';
import Paragraph from './atoms/Paragraph';
import UserAvatar from './UserAvatar';

export interface ReviewerInfoProps {
    name: string;
    image: string;
    reviewCount: number;
    className?: string;
}

export const ReviewerInfo: React.FC<ReviewerInfoProps> = ({
    name,
    image,
    reviewCount,
    className = '',
}) => {

    const { t } = useTranslation();
    
    return (
        <div className={`flex items-center space-x-4 ${className}`}>
            <UserAvatar imageUrl={image} size="size-12" />
            <div className="flex flex-col">
                <Paragraph className="text-content text-1 mt-3 font-bold">
                    {name}
                </Paragraph>

                <Paragraph className="text-gray-persist text-1 mt-3">
                    {reviewCount} {t('reviews')}
                </Paragraph>
            </div>
        </div>
    );
};
