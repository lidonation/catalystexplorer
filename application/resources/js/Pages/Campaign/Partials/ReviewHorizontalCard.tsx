import { Star } from 'lucide-react';

const ReviewHorizontalCard = ({ 
  avatarUrl = '/api/placeholder/40/40',
  userName = 'Phuffy King',
  reviewCount = 0,
  rating = 3,
  content = 'Lorem Ipsum bla',
}) => {
  const renderStars = () => {
    return Array(5).fill(0).map((_, index) => (
      <Star
        key={index}
        size={16}
        className={`${index < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
      />
    ));
  };

  return (
    <div className={`flex items-start space-x-4 p-4 bg-background rounded-lg shadow-sm`}>
      <div className="flex-shrink-0">
        <img
          src={avatarUrl}
          alt={`${userName}'s avatar`}
          className="w-16 h-16 rounded-full"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-sm font-medium text-content">{userName}</h3>
            <p className="text-sm text-dark">{reviewCount} Reviews</p>
          </div>
          
          <div className="flex items-center space-x-1">
            {renderStars()}
            <span className="ml-2 text-sm font-medium text-content">{rating}</span>
          </div>
        </div>
        
        <p className="mt-2 text-sm text-dark line-clamp-3">{content}</p>
      </div>
    </div>
  );
};

export default ReviewHorizontalCard;
