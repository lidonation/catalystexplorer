import ModelSearch from '@/Components/ModelSearch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/Tabs';
import { useBookmarkContext } from '@/Context/BookmarkContext';
import React, { ReactNode } from 'react';

interface BookmarkModelSearchProps {
    children?: ReactNode;
    modelTypes?: {
        name: string;
        type: string;
    }[];
    handleTabchange?: (val: string) => void;
    activeTab?: string;
}

const defaultTypes = [
    {
        name: 'Proposals',
        type: 'proposals',
    },
    {
        name: 'IdeascaleProfiles',
        type: 'ideascaleProfiles',
    },
    {
        name: 'Groups',
        type: 'groups',
    },
    {
        name: 'Reviews',
        type: 'reviews',
    },
    {
        name: 'Communities',
        type: 'communities',
    },
];

const BookmarkModelSearch: React.FC<BookmarkModelSearchProps> = ({
    children,
    modelTypes = defaultTypes,
    handleTabchange = () => {},
    activeTab = 'proposals',
}) => {
    const { bookmarkCollection } = useBookmarkContext();

    return (
        <Tabs
            onValueChange={(val) => handleTabchange(val)}
            defaultValue={activeTab}
            className="sticky top-0 right-0 left-0 h-full"
        >
            <TabsList className="no-scrollbar w-max max-w-full overflow-x-auto scroll-smooth whitespace-nowrap">
                {' '}
                {modelTypes.map(({ name, type }) => (
                    <TabsTrigger
                        className="flex gap-3 font-semibold hover:cursor-pointer"
                        value={type}
                        key={type}
                    >
                        <span>{name}</span>
                        <span
                            className={`flex min-w-[2em] items-center justify-center rounded-full border px-2 py-0.5 text-sm transition-all ${
                                activeTab === type &&
                                'border-primary bg-blue-50'
                            }`}
                        >
                            {bookmarkCollection?.types_count?.[type] ?? 0}
                        </span>
                    </TabsTrigger>
                ))}
            </TabsList>
            {modelTypes.map(({ type }) => (
                <TabsContent value={type} key={type}>
                    <ModelSearch
                        key={type}
                        className=""
                        placeholder={`${type == 'reviews' ? 'Search for reviews via proposal title' : `Search for ${type} to add`}`}
                        domain={type}
                    />
                    {children}
                </TabsContent>
            ))}
        </Tabs>
    );
};

export default BookmarkModelSearch;
