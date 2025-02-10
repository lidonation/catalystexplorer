import Rating from '@/Components/Rating';
import { useTranslation } from 'react-i18next';
import IdeacaleLogo from '@/assets/images/ideascale-logo.png';

const reviewData = {
  user: {
    name: "Phuffy King",
    avatar: IdeacaleLogo,
    reviewCount: 21
  },
  content: "Lido Nation Foundation provides blockchain education in plain English, Kiswahili $ Espanol, outreach, and global community-building: because the future is for everyone. ticker: lido #ADAChain"
};

const ReviewHorizontalCard = () => {
  const { t } = useTranslation();
  return (
    <div className="py-3 bg-background rounded-xl shadow-lg">
      <div className="flex items-start">
        <div className="ml-4 flex-shrink-0 w-12 mt-4">
          <img
            src={reviewData.user.avatar}
            alt={`${reviewData.user.name}'s avatar`}
            className="w-12 h-12 rounded-full"
          />
        </div>
        
        <div className="flex-1 min-w-0 pl-3">
          <div className="flex items-start justify-between mt-4">
            <div>
              <h3 className="text-xl font-medium text-content">{reviewData.user.name}</h3>
              <p className="text-m text-gray-500">
                {reviewData.user.reviewCount} {t('reviews')}
              </p>
            </div>
            
            <Rating />
          </div>
        </div>
      </div>
      
      <p className="mt-1.5 text-l text-gray-500 leading-normal ml-4 mb-4 mr-4">
        {reviewData.content}
      </p>
    </div>
  );
};

export default ReviewHorizontalCard;
