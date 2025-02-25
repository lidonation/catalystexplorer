import React from "react";
import { Link } from "@inertiajs/react";
import { useFilterContext } from "@/Context/FiltersContext";
import { ParamsEnum } from "@/enums/proposal-search-params";

interface BookmarkNavigationProps {
    counts: Record<string, number>;
    activeType: string | null;
    onTypeChange: (type: string) => void;
    proposals?: any[];
    people?: any[];
    groups?: any[];
    reviews?: any[];
    isSticky?: boolean;
}

const BookmarkNavigation: React.FC<BookmarkNavigationProps> = ({
    activeType, 
    onTypeChange,
    proposals = [],
    people = [],
    groups = [],
    reviews = [],
    isSticky = false
}) => {
    const { getFilter } = useFilterContext();
    const searchQuery = getFilter(ParamsEnum.QUERY) || '';

    const filterItems = (items: any[], fields: string[]) => {
        if (!searchQuery) return items;

        return items.filter(item => {
            if (!item) return false;
            return fields.some(field => 
                item[field]?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        });
    };

    const modelTypes = [
        { 
            name: 'Proposals', 
            type: 'proposals', 
            count: filterItems(proposals, ['title', 'description', 'challenge']).length 
        },
        { 
            name: 'People', 
            type: 'people', 
            count: filterItems(people, ['name', 'email']).length 
        },
        { 
            name: 'Groups', 
            type: 'groups', 
            count: filterItems(groups, ['name', 'description']).length 
        },
        { 
            name: 'Reviews', 
            type: 'reviews', 
            count: filterItems(reviews, ['title', 'content']).length 
        }
    ];

    const handleTabClick = (type: string) => {
        onTypeChange(type);
    };

    return (
        <nav className={`border-b border-gray-200 ${isSticky ? 'fixed top-0 left-0 right-0 z-10 bg-background' : ''}`}>
            <div className="flex space-x-8">
                {modelTypes.map(({ name, type, count }) => (
                    <Link
                        href={`#${type}`}
                        key={type}
                        onClick={() => handleTabClick(type)}
                        preserveState
                        preserveScroll
                        className={`group flex items-center gap-2 py-2 outline-hidden transition-colors hover:text-content-dark ${
                        activeType === type &&
                        '-mb-px border-b-2 border-b-primary text-primary'
                        }`}
                    >
                        {name}
                        <span
                        className={`flex min-w-[2em] items-center justify-center rounded-full border px-2 py-0.5 text-sm transition-all ${
                            activeType === type &&
                            'border-primary bg-blue-50'
                        }`}
                        >
                        {count}
                        </span>
                    </Link>
                ))}
            </div>
        </nav>
    )
}

export default BookmarkNavigation;
