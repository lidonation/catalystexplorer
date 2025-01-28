import { useLocalizedRoute } from '@/utils/localizedRoute';
import { router } from '@inertiajs/react';
import React, { createContext, useContext, useState } from 'react';
import { List, ListContextState } from '../../types/general';

interface ExtendedListContextState extends ListContextState {
    bookmarkedEntities: Set<number>;
    bookmarkToListMap: Record<number, string[]>;
    isProcessingBookmark: boolean;
}

interface ListContextValue extends ExtendedListContextState {
    fetchLists: () => Promise<void>;
    addList: (data: Omit<List, 'id' | 'createdAt'>) => Promise<void>;
    toggleBookmark: (entityId: number, entityType: string) => Promise<void>;
    isBookmarked: (entityId: number) => boolean;
    addBookmarkToList: (entityId: number, listId: string) => Promise<void>;
    removeBookmarkFromList: (entityId: number, listId: string) => Promise<void>;
}

const ListContext = createContext<ListContextValue | undefined>(undefined);

export function ListProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<ExtendedListContextState>({
        lists: [],
        isLoadingLists: false,
        isAddingList: false,
        isProcessingBookmark: false,
        error: null,
        latestAddedList: null,
        bookmarkedEntities: new Set(),
        bookmarkToListMap: {},
    });
    const createRoute = useLocalizedRoute('my.bookmarks.create');
    const getDeleteRoute = (id: number) =>
        useLocalizedRoute('my.bookmarks.delete', { id });

    const fetchLists = async () => {
        setState((prev) => ({ ...prev, isLoadingLists: true, error: null }));
        const dummyData = [
            {
                id: '1',
                title: 'List 1',
                content: 'Description 1',
                createdAt: new Date().toISOString(),
            },
            {
                id: '2',
                title: 'List 2',
                content: 'Description 2',
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

    const addList = async (listData: Omit<List, 'id' | 'createdAt'>) => {
        const newList = {
            ...listData,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
        };

        setState((prev) => ({ ...prev, isAddingList: true, error: null }));

        try {
            router.post(
                createRoute,
                { collection: { ...newList }, entity: 'bookmarkCollection' },
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        setState((prev) => ({
                            ...prev,
                            lists: [...prev.lists, newList],
                            isAddingList: false,
                            latestAddedList: newList,
                        }));
                    },
                    onError: (error) => {
                        console.error('Error while adding list', error);
                        throw error?.[0];
                    },
                },
            );
        } catch (error) {
            console.error('Error while adding list', error);
            setState((prev) => ({
                ...prev,
                error: error as Error,
                isAddingList: false,
            }));
            throw error;
        }
    };

    const toggleBookmark = async (entityId: number, entityType: string) => {
        const isCurrentlyBookmarked = state.bookmarkedEntities.has(entityId);

        setState((prev) => ({
            ...prev,
            isProcessingBookmark: true,
        }));

        try {
            if (!isCurrentlyBookmarked) {
                // Add bookmark
                await router.post(
                    createRoute,
                    {
                        model_type: entityType,
                        model_id: entityId,
                        entity: 'bookmark',
                    },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        onSuccess: () => {
                            setState((prev) => {
                                const newBookmarked = new Set(
                                    prev.bookmarkedEntities,
                                );
                                newBookmarked.add(entityId);
                                return {
                                    ...prev,
                                    bookmarkedEntities: newBookmarked,
                                    isProcessingBookmark: false,
                                };
                            });
                        },
                        onError: () => {
                            setState((prev) => ({
                                ...prev,
                                isProcessingBookmark: false,
                                error: new Error('Failed to add bookmark'),
                            }));
                        },
                    },
                );
            } else {
                // Remove bookmark
                await router.delete(getDeleteRoute(entityId), {
                    data: {
                        bookmark_item_id: entityId,
                    },
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        setState((prev) => {
                            const newBookmarked = new Set(
                                prev.bookmarkedEntities,
                            );
                            newBookmarked.delete(entityId);
                            // Clean up list associations
                            const newBookmarkToListMap = {
                                ...prev.bookmarkToListMap,
                            };
                            delete newBookmarkToListMap[entityId];
                            return {
                                ...prev,
                                bookmarkedEntities: newBookmarked,
                                bookmarkToListMap: newBookmarkToListMap,
                                isProcessingBookmark: false,
                            };
                        });
                    },
                    onError: () => {
                        setState((prev) => ({
                            ...prev,
                            isProcessingBookmark: false,
                            error: new Error('Failed to remove bookmark'),
                        }));
                    },
                });
            }
        } catch (error) {
            console.error('Error while toggling bookmark', error);
            setState((prev) => ({
                ...prev,
                isProcessingBookmark: false,
                error: error as Error,
            }));
        }
    };

    const isBookmarked = (entityId: number) =>
        state.bookmarkedEntities.has(entityId);

    const addBookmarkToList = async (entityId: number, listId: string) => {
        setState((prev) => {
            const currentLists = prev.bookmarkToListMap[entityId] || [];
            return {
                ...prev,
                bookmarkToListMap: {
                    ...prev.bookmarkToListMap,
                    [entityId]: [...new Set([...currentLists, listId])],
                },
            };
        });
    };

    const removeBookmarkFromList = async (entityId: number, listId: string) => {
        setState((prev) => {
            const currentLists = prev.bookmarkToListMap[entityId] || [];
            return {
                ...prev,
                bookmarkToListMap: {
                    ...prev.bookmarkToListMap,
                    [entityId]: currentLists.filter((id) => id !== listId),
                },
            };
        });
    };

    const value = {
        ...state,
        fetchLists,
        addList,
        toggleBookmark,
        isBookmarked,
        addBookmarkToList,
        removeBookmarkFromList,
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
