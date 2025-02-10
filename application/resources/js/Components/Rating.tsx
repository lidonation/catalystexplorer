import { Star } from 'lucide-react';

const Rating = ({
  rating = 3.25,
}) => {
  const renderStars = () => {
    return Array(5).fill(0).map((_, index) => {
      const fraction = rating - index;
      const fillPercentage = Math.max(0, Math.min(1, fraction)) * 100;
      
      // Map percentage to closest Tailwind width class
      const getWidthClass = (percentage: number) => {
        if (percentage <= 0) return 'w-0';
        if (percentage <= 25) return 'w-1/4';
        if (percentage <= 50) return 'w-1/2';
        if (percentage <= 75) return 'w-3/4';
        return 'w-full';
      };
      
      return (
        <div key={index} className="relative">
          {/* Background star */}
          <Star
            size={14}
            className="fill-gray-200 text-gray-200"
          />
          
          {/* Filled overlay */}
          {fillPercentage > 0 && (
            <div 
              className={`absolute inset-0 overflow-hidden ${getWidthClass(fillPercentage)}`}
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
