import ModelSearch from '@/Components/ModelSearch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/Tabs';
import React from 'react';

interface BookmarkModelSearchProps {
}

const BookmarkModelSearch: React.FC<BookmarkModelSearchProps> = ({
}) => {
    const modelTypes = [
        {
            name: 'Proposals',
            type: 'proposals',
        },
        {
            name: 'IdeascaleProfiles',
            type: 'ideascale-profiles',
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

    return (
        <Tabs
            defaultValue={modelTypes[0].type}
            className="sticky top-0 right-0 left-0 h-full w-full"
        >
            <TabsList>
                {modelTypes.map(({ name, type }) => (
                    <TabsTrigger className="font-semibold" value={type}>
                        {name}
                    </TabsTrigger>
                ))}
            </TabsList>
            {modelTypes.map(({ type }) => (
                <TabsContent value={type}>
                    <ModelSearch
                        className=""
                        placeholder={`${type == 'reviews' ? 'Search for reviews via proposal title' : `Search for ${type} to add`}`}
                        domain={type}
                    />
                </TabsContent>
            ))}
        </Tabs>
    );
};

export default BookmarkModelSearch;
