import React from "react";

const BookmarkNavigation = () => {
    const sections = [
        { name: 'Proposals', count: 30, isActive: true },
        { name: 'People', count: 13, isActive: false },
        { name: 'Groups', count: 28, isActive: false },
        { name: 'Communities', count: 16, isActive: false },
        { name: 'Reviews', count: 64, isActive: false },
        { name: 'Articles', count: 5, isActive: false }
    ];

    return (
        <nav className="border-b border-gray-200">
            <div className="flex space-x-8">
                {sections.map(({ name, count, isActive }) => (
                    <a
                        key={name}
                        href="#"
                        className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 ${
                        isActive
                            ? 'border-primary text-primary'
                            : 'border-transparent text-content hover:text-purple-600 hover:border-purple-600'
                        }`}
                    >
                        {name}
                        <span
                        className={`ml-2 rounded-full px-2.5 py-0.5 text-xs ${
                            isActive
                            ? 'bg-blue-100 border-primary text-primary'
                            : 'bg-background text-content'
                        }`}
                        >
                        {count}
                        </span>
                    </a>
                ))}
            </div>
        </nav>
    )
}

export default BookmarkNavigation;
