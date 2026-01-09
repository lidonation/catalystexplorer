import axiosClient from '@/utils/axiosClient';
import EventBus from '@/utils/eventBus';
import { useCallback, useEffect, useState } from 'react';
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

export default function useBookmark({ modelType, itemId }: UseBookmarkProps) {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [bookmarkId, setBookmarkId] = useState<string | null>(null);
    const [associatedCollection, setAssociatedCollection] = useState<
        string | null
    >(null);
    const [collections, setCollections] = useState<BookmarkCollection[]>([]);
    const [collectionsCount, setCollectionsCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const fetchBookmarkStatus = useCallback(async () => {
        try {
            const response = await axiosClient.get(
                route('api.bookmarks.status', { modelType, uuid: itemId }),
            );
            setIsBookmarked(response.data.isBookmarked);
            setBookmarkId(response.data.id || null);
            setAssociatedCollection(response.data?.collection?.id || null);
            setCollections(response.data?.collections || []);
            setCollectionsCount(response.data?.collectionsCount || 0);
        } catch (error) {
            console.error('Error fetching bookmark status', error);
        }
    }, [modelType, itemId]);

    useEffect(() => {
        fetchBookmarkStatus();
    }, [fetchBookmarkStatus]);

    // Listen for bookmark changes from other components to stay in sync
    useEffect(() => {
        const handleBookmarkChange = () => {
            fetchBookmarkStatus();
        };

        EventBus.on('listItem-added', handleBookmarkChange);
        EventBus.on('listItem-removed', handleBookmarkChange);

        return () => {
            EventBus.off('listItem-added', handleBookmarkChange);
            EventBus.off('listItem-removed', handleBookmarkChange);
        };
    }, [fetchBookmarkStatus]);

    const createBookmark = async (): Promise<string | null> => {
        try {
            const response = await axiosClient.post(
                route('api.bookmarks.store', { modelType, uuid: itemId }),
            );
             
            if (response.data.bookmarkId) {
                setIsBookmarked(response.data.isBookmarked || true);
                setBookmarkId(response.data.bookmarkId);
                setIsOpen(true);
                EventBus.emit('listItem-added');
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
    };

    const removeBookmark = async (specificBookmarkId?: string) => {
        try {
            const idToRemove = specificBookmarkId || bookmarkId;
            if (idToRemove) {
                await axiosClient.delete(
                    route('api.bookmarks.remove', {
                        bookmarkItem: idToRemove,
                    }),
                );
                
                // If removing a specific collection bookmark, refresh status
                if (specificBookmarkId) {
                    await fetchBookmarkStatus();
                } else {
                    setIsBookmarked(false);
                    setCollections([]);
                    setCollectionsCount(0);
                }
                
                setIsOpen(false);
                toast.success('Bookmark removed successfully!', {
                    className: 'bg-gray-800 text-white',
                    toastId: 'bookmark-removed',
                });
                EventBus.emit('listItem-removed');
            }
        } catch (error) {
            console.error('Error removing bookmark:', error);
            toast.error('Failed to remove bookmark.');
        }
    };

    // Remove bookmark from all collections completely
    const removeAllBookmarks = async () => {
        try {
            // Remove primary bookmark
            if (bookmarkId) {
                await axiosClient.delete(
                    route('api.bookmarks.remove', { bookmarkItem: bookmarkId }),
                );
            }
            
            // Remove all collection bookmarks
            for (const col of collections) {
                await axiosClient.delete(
                    route('api.bookmarks.remove', { bookmarkItem: col.bookmarkItemId }),
                );
            }
            
            setIsBookmarked(false);
            setCollections([]);
            setCollectionsCount(0);
            setIsOpen(false);
            
            toast.success('Bookmark removed from all lists!', {
                className: 'bg-gray-800 text-white',
                toastId: 'bookmark-removed-all',
            });
            EventBus.emit('listItem-removed');
        } catch (error) {
            console.error('Error removing all bookmarks:', error);
            toast.error('Failed to remove bookmark.');
        }
    };

    const toggleBookmark = async () => {
        if (isBookmarked) {
            // If not in any collections, remove immediately
            if (collectionsCount === 0) {
                await removeBookmark();
            } else {
                // Show popup to let user choose which collections to remove from
                setIsOpen(true);
            }
        } else {
            await createBookmark();
        }
    };

    return {
        bookmarkId,
        associatedCollection,
        collections,
        collectionsCount,
        isBookmarked,
        toggleBookmark,
        createBookmark,
        removeBookmark,
        refetchStatus: fetchBookmarkStatus,
        isOpen,
        setIsOpen,
    };
}
