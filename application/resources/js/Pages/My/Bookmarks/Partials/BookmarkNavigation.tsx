import React from "react";

interface BookmarkNavigationProps {
    counts: Record<string, number>;
    activeType: string | null;
    onTypeChange: (type: string) => void;
}

const BookmarkNavigation: React.FC<BookmarkNavigationProps> = ({ 
    counts, 
    activeType, 
    onTypeChange 
}) => {
    const sections = [
        { name: 'Proposals', type: 'proposals', count: counts?.proposals || 0 },
        { name: 'People', type: 'people', count: counts?.ideascale_profiles || 0 },
        { name: 'Groups', type: 'groups', count: counts?.groups || 0 },
        { name: 'Reviews', type: 'reviews', count: counts?.reviews || 0 }
    ];

    return (
        <nav className="border-b border-gray-200">
            <div className="flex space-x-8">
                {sections.map(({ name, type, count }) => (
                    <button
                        key={type}
                        onClick={() => onTypeChange(type)}
                        className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 ${
                        activeType === type
                            ? 'border-primary text-primary'
                            : 'border-transparent text-content hover:text-purple-600 hover:border-purple-600'
                        }`}
                    >
                        {name}
                        <span
                        className={`ml-2 rounded-full px-2.5 py-0.5 text-xs ${
                            activeType === type
                            ? 'bg-blue-100 border-primary text-primary'
                            : 'bg-background text-content'
                        }`}
                        >
                        {count}
                        </span>
                    </button>
                ))}
            </div>
        </nav>
    )
}

export default BookmarkNavigation;
