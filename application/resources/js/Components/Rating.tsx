import { Star } from 'lucide-react';

const Rating = ({
  rating = 3.5,
}) => {
  const renderStars = () => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = (rating % 1) >= 0.5;

    return Array(5).fill(0).map((_, index) => {
      const isFullStar = index < fullStars;
      const isHalfStar = !isFullStar && hasHalfStar && index === fullStars;
      
      return (
        <div key={index} className="relative">
          {/* Background star */}
          <Star
            size={14}
            className="fill-gray-200 text-gray-200"
          />
          
          {/* Filled overlay */}
          {(isFullStar || isHalfStar) && (
            <div 
              className={`absolute inset-0 overflow-hidden ${
                isHalfStar ? 'w-1/2' : 'w-full'
              }`}
            >
              <Star
                size={14}
                className="fill-yellow-400 text-yellow-400"
              />
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex items-center mr-4">
      <div className="flex items-center space-x-0.5 mr-2">
        {renderStars()}
      </div>
      <span className="text-xl font-medium text-content mt-1">
        {Number(rating).toFixed(1)}
      </span>
    </div>
  );
};

export default Rating;
