import { Star } from 'lucide-react';

const Rating = ({
    rating = 2,
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
        <div className="flex items-center mr-4">
            <div className="flex items-center space-x-0.5 mr-2">
                {renderStars()}
            </div>
            <span className="text-xl font-medium text-content mt-1">{rating}</span>
        </div>
    );
};

export default Rating;
