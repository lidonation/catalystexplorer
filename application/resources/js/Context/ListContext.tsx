import React, { createContext, useContext, useState } from 'react';
import { List, ListContextState } from '../../types/general';
import {router} from "@inertiajs/react";

interface ListContextValue extends ListContextState {
    fetchLists: () => Promise<void>;
    addList: (data: Omit<List, 'id' | 'createdAt'>) => Promise<void>;
}

const ListContext = createContext<ListContextValue | undefined>(undefined);

export function ListProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<ListContextState>({
        lists: [],
        isLoadingLists: false,
        isAddingList: false,
        error: null,
        latestAddedList: null,
    });

    const fetchLists = async () => {
        setState((prev) => ({ ...prev, isLoadingLists: true, error: null }));
        const dummyData = [
            {
                id: '1',
                name: 'List 1',
                description: 'Description 1',
                createdAt: new Date().toISOString(),
            },
            {
                id: '2',
                name: 'List 2',
                description: 'Description 2',
                createdAt: new Date().toISOString(),
            },
        ];

        try {
            await new Promise((resolve) => setTimeout(resolve, 4000));
            setState((prev) => ({
                ...prev,
                lists: dummyData,
                isLoadingLists: false,
            }));
        } catch (error) {
            setState((prev) => ({
                ...prev,
                error: error as Error,
                isLoadingLists: false,
            }));
        }
    };

    const createList = async (listData: Omit<List, 'id' | 'createdAt'>) => {
        setState((prev) => ({ ...prev, isAddingList: true, error: null }));

        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            router.post(route('my.bookmarks.collections.create'), listData);
        } catch (error) {
            setState((prev) => ({
                ...prev,
                error: error as Error,
                isAddingList: false,
            }));
        }
    };

    const value = {
        ...state,
        fetchLists,
        addList: createList,
    };

    return (
        <ListContext.Provider value={value}>{children}</ListContext.Provider>
    );
}

export function useList() {
    const context = useContext(ListContext);
    if (context === undefined) {
        throw new Error('useList must be used within a ListProvider');
    }
    return context;
}
