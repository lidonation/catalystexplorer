import ModelSearch from '@/Components/ModelSearch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/Tabs';
import React, { ReactNode, useState } from 'react';

interface BookmarkModelSearchProps {
    children?: ReactNode;
    modelTypes?: {
        name: string;
        type: string;
    }[];
    handleTabchange?: (val: string) => void;
    activeTab?:string;
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
    activeTab = 'proposals'
}) => {
    return (
        <Tabs
            onValueChange={(val) => handleTabchange(val)}
            defaultValue={activeTab}
            className="sticky top-0 right-0 left-0 h-full w-full"
        >
            <TabsList className="no-scrollbar overflow-x-auto">
                {modelTypes.map(({ name, type }) => (
                    <TabsTrigger
                        className="font-semibold hover:cursor-pointer"
                        value={type}
                        key={type}
                    >
                        {name}
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
