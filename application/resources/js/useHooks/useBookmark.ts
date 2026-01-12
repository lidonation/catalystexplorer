import { usePage } from '@inertiajs/react';
import axiosClient from '@/utils/axiosClient';
import EventBus from '@/utils/eventBus';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';

interface UseBookmarkProps {
    modelType: string;
    itemId: string;
}

export interface BookmarkCollection {
    bookmarkItemId: string;
    collectionId: string;
    title: string;
}

interface BookmarkState {
    isBookmarked: boolean;
    bookmarkId: string | null;
    associatedCollection: string | null;
    collections: BookmarkCollection[];
    allBookmarkItemIds: string[];
}

const initialState: BookmarkState = {
    isBookmarked: false,
    bookmarkId: null,
    associatedCollection: null,
    collections: [],
    allBookmarkItemIds: [],
};

export default function useBookmark({ modelType, itemId }: UseBookmarkProps) {
    const user = usePage().props?.auth?.user;
    const isAuthenticated = !!user;

    const [state, setState] = useState<BookmarkState>(initialState);
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const isDeletingRef = useRef(isDeleting);
    isDeletingRef.current = isDeleting;

    const fetchBookmarkStatus = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            const response = await axiosClient.get(
                route('api.bookmarks.status', { modelType, uuid: itemId }),
            );
            setState({
                isBookmarked: response.data.isBookmarked,
                bookmarkId: response.data.id ?? null,
                associatedCollection: response.data?.collection?.id ?? null,
                collections: response.data?.collections ?? [],
                allBookmarkItemIds: response.data?.allBookmarkItemIds ?? [],
            });
        } catch (error) {
            console.error('Error fetching bookmark status', error);
        }
    }, [modelType, itemId, isAuthenticated]);

    useEffect(() => {
        fetchBookmarkStatus().then();
    }, [fetchBookmarkStatus]);

    useEffect(() => {
        if (!isAuthenticated) return;

        const handleBookmarkChange = (eventItemId?: string) => {
            if (!isDeletingRef.current && eventItemId === itemId) {
                fetchBookmarkStatus();
            }
        };

        EventBus.on('listItem-added', handleBookmarkChange);
        EventBus.on('listItem-removed', handleBookmarkChange);

        return () => {
            EventBus.off('listItem-added', handleBookmarkChange);
            EventBus.off('listItem-removed', handleBookmarkChange);
        };
    }, [fetchBookmarkStatus, itemId, isAuthenticated]);

    const createBookmark = useCallback(async (): Promise<string | null> => {
        try {
            const response = await axiosClient.post(
                route('api.bookmarks.store', { modelType, uuid: itemId }),
            );

            if (response.data.bookmarkId) {
                setState((prev) => ({
                    ...prev,
                    isBookmarked: response.data.isBookmarked ?? true,
                    bookmarkId: response.data.bookmarkId,
                }));
                setIsOpen(true);
                EventBus.emit('listItem-added', itemId);
                toast.success('Bookmark created successfully!', {
                    className: 'bg-gray-800 text-white',
                    toastId: 'bookmark-created',
                });
                return response.data.bookmarkId;
            }
            return null;
        } catch (error) {
            console.error('Error creating bookmark:', error);
            return null;
        }
    }, [modelType, itemId]);

    const addToCollection = useCallback(
        (collectionId: string, collectionTitle: string): string => {
            const tempBookmarkItemId = `temp-${Date.now()}`;
            setState((prev) => ({
                ...prev,
                collections: [
                    ...prev.collections,
                    {
                        bookmarkItemId: tempBookmarkItemId,
                        collectionId,
                        title: collectionTitle,
                    },
                ],
            }));
            return tempBookmarkItemId;
        },
        [],
    );

    const updateCollectionAfterAdd = useCallback(async () => {
        await fetchBookmarkStatus();
    }, [fetchBookmarkStatus]);

    const removeBookmark = useCallback(
        async (specificBookmarkId?: string) => {
            try {
                if (specificBookmarkId) {
                    setState((prev) => ({
                        ...prev,
                        collections: prev.collections.filter(
                            (c) => c.bookmarkItemId !== specificBookmarkId,
                        ),
                    }));

                    await axiosClient.delete(
                        route('api.bookmarks.remove', {
                            bookmarkItem: specificBookmarkId,
                        }),
                    );

                    EventBus.emit('listItem-removed', itemId);
                    return;
                }

                const idsToDelete =
                    state.allBookmarkItemIds.length > 0
                        ? state.allBookmarkItemIds
                        : [state.bookmarkId].filter(Boolean) as string[];

                if (idsToDelete.length === 0) return;

                setIsDeleting(true);
                setState(initialState);
                setIsOpen(false);

                await Promise.all(
                    idsToDelete.map((id) =>
                        axiosClient
                            .delete(
                                route('api.bookmarks.remove', {
                                    bookmarkItem: id,
                                }),
                            )
                            .catch((err) =>
                                console.warn(
                                    'Failed to delete bookmark item:',
                                    id,
                                    err,
                                ),
                            ),
                    ),
                );

                setIsDeleting(false);
                toast.success('Bookmark removed successfully!', {
                    className: 'bg-gray-800 text-white',
                    toastId: 'bookmark-removed',
                });
                EventBus.emit('listItem-removed', itemId);
            } catch (error) {
                console.error('Error removing bookmark:', error);
                setIsDeleting(false);
                await fetchBookmarkStatus();
                toast.error('Failed to remove bookmark.');
            }
        },
        [
            state.allBookmarkItemIds,
            state.bookmarkId,
            itemId,
            fetchBookmarkStatus,
        ],
    );

    const toggleBookmark = useCallback(async () => {
        if (state.isBookmarked) {
            setIsOpen(true);
        } else {
            await createBookmark();
        }
    }, [state.isBookmarked, createBookmark]);

    const setCollections = useCallback(
        (
            updater:
                | BookmarkCollection[]
                | ((prev: BookmarkCollection[]) => BookmarkCollection[]),
        ) => {
            setState((prev) => ({
                ...prev,
                collections:
                    typeof updater === 'function'
                        ? updater(prev.collections)
                        : updater,
            }));
        },
        [],
    );

    return useMemo(
        () => ({
            bookmarkId: state.bookmarkId,
            associatedCollection: state.associatedCollection,
            collections: state.collections,
            setCollections,
            isBookmarked: state.isBookmarked,
            toggleBookmark,
            createBookmark,
            removeBookmark,
            addToCollection,
            updateCollectionAfterAdd,
            refetchStatus: fetchBookmarkStatus,
            isOpen,
            setIsOpen,
        }),
        [
            state,
            setCollections,
            toggleBookmark,
            createBookmark,
            removeBookmark,
            addToCollection,
            updateCollectionAfterAdd,
            fetchBookmarkStatus,
            isOpen,
        ],
    );
}
