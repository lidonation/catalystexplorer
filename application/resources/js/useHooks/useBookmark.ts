import { usePage } from '@inertiajs/react';
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
    const user = usePage().props?.auth?.user;
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [bookmarkId, setBookmarkId] = useState<string | null>(null);
    const [associatedCollection, setAssociatedCollection] = useState<
        string | null
    >(null);
    const [collections, setCollections] = useState<BookmarkCollection[]>([]);
    const [allBookmarkItemIds, setAllBookmarkItemIds] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchBookmarkStatus = useCallback(async () => {
        try {
            const response = await axiosClient.get(
                route('api.bookmarks.status', { modelType, uuid: itemId }),
            );
            setIsBookmarked(response.data.isBookmarked);
            setBookmarkId(response.data.id || null);
            setAssociatedCollection(response.data?.collection?.id || null);
            setCollections(response.data?.collections || []);
            setAllBookmarkItemIds(response.data?.allBookmarkItemIds || []);
        } catch (error) {
            console.error('Error fetching bookmark status', error);
        }
    }, [modelType, itemId]);

    useEffect(() => {
        fetchBookmarkStatus();
    }, [fetchBookmarkStatus]);

    useEffect(() => {
        const handleBookmarkChange = (eventItemId?: string) => {
            if (!isDeleting && eventItemId === itemId) {
                fetchBookmarkStatus();
            }
        };

        EventBus.on('listItem-added', handleBookmarkChange);
        EventBus.on('listItem-removed', handleBookmarkChange);

        return () => {
            EventBus.off('listItem-added', handleBookmarkChange);
            EventBus.off('listItem-removed', handleBookmarkChange);
        };
    }, [fetchBookmarkStatus, isDeleting, itemId]);

    const createBookmark = async (): Promise<string | null> => {
        try {
            const response = await axiosClient.post(
                route('api.bookmarks.store', { modelType, uuid: itemId }),
            );
             
            if (response.data.bookmarkId) {
                setIsBookmarked(response.data.isBookmarked || true);
                setBookmarkId(response.data.bookmarkId);
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
    };

    const addToCollection = async (collectionId: string, collectionTitle: string) => {

        const tempBookmarkItemId = `temp-${Date.now()}`;
        setCollections(prev => [...prev, {
            bookmarkItemId: tempBookmarkItemId,
            collectionId,
            title: collectionTitle,
        }]);

        try {
            return tempBookmarkItemId;
        } catch (error) {
            // Revert on error
            setCollections(prev => prev.filter(c => c.bookmarkItemId !== tempBookmarkItemId));
            throw error;
        }
    };
    const updateCollectionAfterAdd = async () => {
        await fetchBookmarkStatus();
    };

    const removeBookmark = async (specificBookmarkId?: string) => {
        try {
            const isRemovingFromList = !!specificBookmarkId;
            
            if (isRemovingFromList) {
                setCollections(prev => prev.filter(c => c.bookmarkItemId !== specificBookmarkId));
                
                await axiosClient.delete(
                    route('api.bookmarks.remove', {
                        bookmarkItem: specificBookmarkId,
                    }),
                );
                
                EventBus.emit('listItem-removed', itemId);
            } else {
                const idsToDelete = allBookmarkItemIds.length > 0 
                    ? allBookmarkItemIds 
                    : [bookmarkId].filter(Boolean);
                
                if (idsToDelete.length === 0) {
                    return;
                }
                
                setIsDeleting(true);
                
                setIsBookmarked(false);
                setCollections([]);
                setAllBookmarkItemIds([]);
                setBookmarkId(null);
                setIsOpen(false);
                
                for (const id of idsToDelete) {
                    try {
                        await axiosClient.delete(
                            route('api.bookmarks.remove', {
                                bookmarkItem: id,
                            }),
                        );
                    } catch (err) {
                        console.warn('Failed to delete bookmark item:', id, err);
                    }
                }
                
                setIsDeleting(false);
                toast.success('Bookmark removed successfully!', {
                    className: 'bg-gray-800 text-white',
                    toastId: 'bookmark-removed',
                });
                EventBus.emit('listItem-removed', itemId);
            }
        } catch (error) {
            console.error('Error removing bookmark:', error);
            await fetchBookmarkStatus();
            toast.error('Failed to remove bookmark.');
        }
    };

    const toggleBookmark = async () => {
        if (isBookmarked) {
            setIsOpen(true);
        } else {
            await createBookmark();
        }
    };

    return {
        bookmarkId,
        associatedCollection,
        collections,
        setCollections,
        isBookmarked,
        toggleBookmark,
        createBookmark,
        removeBookmark,
        addToCollection,
        updateCollectionAfterAdd,
        refetchStatus: fetchBookmarkStatus,
        isOpen,
        setIsOpen,
    };
}
