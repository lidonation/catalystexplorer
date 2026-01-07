import api from '@/utils/axiosClient';
import EventBus from '@/utils/eventBus';
import { AxiosError } from 'axios';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React, { createContext, useContext, useState } from 'react';
import { List, ListContextState } from '../types/general';

const PREFERRED_LIST_KEY = 'bookmark_preferred_list';
const CONSECUTIVE_THRESHOLD = 2;

interface PreferredListData {
    listId: string;
    listTitle: string;
    count: number;
}

const getStoredPreferredList = (): PreferredListData | null => {
    try {
        const stored = sessionStorage.getItem(PREFERRED_LIST_KEY);
        if (stored) {
            const data = JSON.parse(stored) as PreferredListData;
            if (data.count >= CONSECUTIVE_THRESHOLD) {
                return data;
            }
        }
    } catch (e) {
        console.error('Error reading preferred list:', e);
    }
    return null;
};

interface ListContextValue extends ListContextState {
    fetchLists: () => Promise<void>;
    addList: (data: Omit<List, 'id' | 'createdAt'>) => Promise<void>;
    addBookmarkToList: (listId: string, bookmarkId: string, listTitle?: string) => Promise<void>;
    removeBookmarkFromList: (
        listId: string,
        bookmarkId: string,
    ) => Promise<void>;
    getPreferredList: () => PreferredListData | null;
    clearPreferredList: () => void;
}

const ListContext = createContext<ListContextValue | undefined>(undefined);

export function ListProvider({ children }: { children: React.ReactNode }) {
    const { t } = useLaravelReactI18n();
    const [state, setState] = useState<ListContextState>({
        lists: [],
        isLoadingLists: false,
        isAddingList: false,
        error: null,
        latestAddedList: null,
    });
    const updatePreferredList = (listId: string, listTitle: string) => {
        try {
            const stored = sessionStorage.getItem(PREFERRED_LIST_KEY);
            let data: PreferredListData;

            if (stored) {
                const existing = JSON.parse(stored) as PreferredListData;
                if (existing.listId === listId) {
                    data = { listId, listTitle, count: existing.count + 1 };
                } else {
                    data = { listId, listTitle, count: 1 };
                }
            } else {
                data = { listId, listTitle, count: 1 };
            }

            sessionStorage.setItem(PREFERRED_LIST_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Error updating preferred list:', e);
        }
    };

    const getPreferredList = (): PreferredListData | null => {
        return getStoredPreferredList();
    };

    const clearPreferredList = () => {
        sessionStorage.removeItem(PREFERRED_LIST_KEY);
    };

    const fetchLists = async () => {
        setState((prev) => ({ ...prev, isLoadingLists: true, error: null }));

        try {
            const res = await api.get(route('api.collections.retrieve'));

            if (res.data?.type === 'success') {
                const listsWithId = res.data?.collections?.map((list: any) => ({
                    ...list,
                    id: list.id,
                }));
                setState((prev) => ({
                    ...prev,
                    lists: listsWithId,
                    isLoadingLists: false,
                }));
            }
        } catch (error) {
            console.error('Error fetching lists:', error);

            setState((prev) => ({
                ...prev,
                error:
                    error instanceof AxiosError
                        ? new Error(
                              error.response?.data?.message ||
                                  t('listQuickCreate.listFetchError'),
                          )
                        : new Error(t('listQuickCreate.listFetchError')),
                isLoadingLists: false,
            }));
        }
    };

    const createList = async (listData: Omit<List, 'id' | 'createdAt'>) => {
        setState((prev) => ({ ...prev, isAddingList: true, error: null }));

        try {
            const res = await api.post(
                route('api.collections.create'),
                listData,
            );

            if (res.data?.type === 'success') {
                setState((prev) => ({
                    ...prev,
                    isAddingList: false,
                    latestAddedList: res.data?.collection,
                    lists: res.data?.collection
                        ? [
                              {
                                  ...res.data.collection,
                                  id: res.data.collection.id || '',
                              },
                              ...prev.lists,
                          ]
                        : prev.lists,
                }));
                return;
            }
        } catch (error) {
            console.error('Error creating list:', error);
            let errorMessage: string;

            if (error instanceof AxiosError) {
                const responseData = error.response?.data;

                if (responseData?.type === 'validation_error') {
                    errorMessage =
                        responseData.message ||
                        t('listQuickCreate.validationErrors.inputCheck');
                } else {
                    errorMessage =
                        responseData?.message ||
                        t('listQuickCreate.listCreateError');
                }
            } else {
                errorMessage = t('listQuickCreate.listCreateError');
            }

            setState((prev) => ({
                ...prev,
                error: new Error(errorMessage),
                isAddingList: false,
            }));

            throw new Error(errorMessage);
        }
    };

    const addBookmarkToList = async (listId: string, bookmarkId: string, listTitle?: string) => {
        try {
            const res = await api.post(route('api.collections.bookmarks.add'), {
                bookmark_collection_id: listId,
                bookmark_ids: [bookmarkId],
            });

            if (res.data?.type === 'success') {
                const list = state.lists.find((l) => l.id === listId);
                const title = listTitle || list?.title || 'List';
                updatePreferredList(listId, title);
                setState((prev) => ({
                    ...prev,
                    isAddingList: false,
                    latestAddedList: res.data?.collection,
                    lists: res.data?.collection
                        ? [
                              {
                                  ...res.data.collection,
                                  id: res.data.collection.id || '',
                              },
                              ...prev.lists,
                          ]
                        : prev.lists,
                }));

                EventBus.emit('listItem-added');
                return;
            }
        } catch (error) {
            console.error('Error adding bookmark to list:', error);
            let errorMessage: string;

            if (error instanceof AxiosError) {
                const responseData = error.response?.data;

                if (responseData?.type === 'validation_error') {
                    errorMessage =
                        responseData.message ||
                        t('listQuickCreate.validationErrors.inputCheck');
                } else {
                    errorMessage =
                        responseData?.message ||
                        t('listQuickCreate.listCreateError');
                }
            } else {
                errorMessage = t('listQuickCreate.listCreateError');
            }

            setState((prev) => ({
                ...prev,
                error: new Error(errorMessage),
                isAddingList: false,
            }));

            throw new Error(errorMessage);
        }
    };
    const removeBookmarkFromList = async (
        listId: string,
        bookmarkId: string,
    ) => {
        try {
            const res = await api.post(
                route('api.collections.bookmarks.remove'),
                {
                    bookmark_collection_id: listId,
                    bookmark_ids: [bookmarkId],
                },
            );

            if (res.data?.type === 'success') {
                setState((prev) => ({
                    ...prev,
                    isAddingList: false,
                    latestAddedList: res.data?.collection,
                    lists: res.data?.collection
                        ? [
                              {
                                  ...res.data.collection,
                                  id: res.data.collection.id || '',
                              },
                              ...prev.lists,
                          ]
                        : prev.lists,
                }));

                EventBus.emit('listItem-removed');
                return;
            }
        } catch (error) {
            console.error('Error removing bookmark from list:', error);
            let errorMessage: string;

            if (error instanceof AxiosError) {
                const responseData = error.response?.data;

                if (responseData?.type === 'validation_error') {
                    errorMessage =
                        responseData.message ||
                        t('listQuickCreate.validationErrors.inputCheck');
                } else {
                    errorMessage =
                        responseData?.message ||
                        t('listQuickCreate.listCreateError');
                }
            } else {
                errorMessage = t('listQuickCreate.listCreateError');
            }

            setState((prev) => ({
                ...prev,
                error: new Error(errorMessage),
                isAddingList: false,
            }));

            throw new Error(errorMessage);
        }
    };

    const value = {
        ...state,
        fetchLists,
        addList: createList,
        addBookmarkToList,
        removeBookmarkFromList,
        getPreferredList,
        clearPreferredList,
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
