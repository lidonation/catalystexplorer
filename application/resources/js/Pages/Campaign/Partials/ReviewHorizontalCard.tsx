import { Star } from 'lucide-react';
import IdeascaleLogo from '@/assets/images/ideascale-logo.png';

const ReviewHorizontalCard = ({ 
  avatarUrl = IdeascaleLogo,
  userName = 'Phuffy King',
  reviewCount = 0,
  rating = 2,
  content = 'Lido Nation Foundation provides blockchain education in plain English, Kiswahili & Español, outreach, and global community-building: because the future is for everyone. ticker: lido #ADAChain',
}) => {
  const renderStars = () => {
    return Array(5).fill(0).map((_, index) => (
      <Star
        key={index}
        size={14}
        className={`${index < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
      />
    ));
  };

  return (
    <div className="py-3 bg-background rounded-xl shadow-lg">
      <div className="flex items-start">
        <div className="ml-4 flex-shrink-0 w-12 mt-4">
          <img
            src={avatarUrl}
            alt={`${userName}'s avatar`}
            className="w-12 h-12 rounded-full"
          />
        </div>
        
        <div className="flex-1 min-w-0 pl-3">
          <div className="flex items-start justify-between mt-4">
            <div>
              <h3 className="text-xl font-medium text-content">{userName}</h3>
              <p className="text-m text-gray-500">{reviewCount} Reviews</p>
            </div>
            
            <div className="flex items-center space-x-0.5 mr-4 mt-4">
              {renderStars()}
              <span className="ml-1 text-xl font-medium text-content">{rating}</span>
            </div>
          </div>
        </div>
      </div>
      
      <p className="mt-1.5 text-l text-gray-500 leading-normal ml-4 mb-4">{content}</p>
    </div>
  );
};

export default ReviewHorizontalCard;
