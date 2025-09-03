import axiosClient from '@/utils/axiosClient';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import EventBus from '@/utils/eventBus';

interface UseBookmarkProps {
    modelType: string;
    itemId: string;
}

export default function useBookmark({ modelType, itemId }: UseBookmarkProps) {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [bookmarkId, setBookmarkId] = useState<string | null>(null);
    const [associatedCollection, setAssociatedCollection] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchBookmarkStatus().then();
    }, [modelType, itemId]);
    const fetchBookmarkStatus = async () => {
        try {
            const response = await axiosClient.get(
                route('api.bookmarks.status', { modelType, uuid: itemId }),
            );
            setIsBookmarked(response.data.isBookmarked);
            setBookmarkId(response.data.id || null);
            setAssociatedCollection(response.data?.collection?.uuid || null);
        } catch (error) {
            console.error('Error fetching bookmark status', error);
        }
    };

    const createBookmark = async () => {
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

            }
        } catch (error) {
            console.error('Error creating bookmark:', error);
        }
    };

    const removeBookmark = async () => {
        try {
            if (bookmarkId) {
                await axiosClient.delete(
                    route('api.bookmarks.remove', {
                        bookmarkItem: bookmarkId,
                    }),
                );
                setIsBookmarked(false);
                setIsOpen(false);
                toast.success('Bookmark removed successfully!', {
                    className: 'bg-gray-800 text-white',
                    toastId: 'bookmark-remove-error',
                });
                EventBus.emit('listItem-removed');
            }
        } catch (error) {
            console.error('Error removing bookmark:', error);
            toast.error('Failed to create bookmark.');
        }
    };

    const toggleBookmark = async () => {
        if (isBookmarked) {
            await removeBookmark();
        } else {
            await createBookmark();
        }
    };

    return {
        bookmarkId,
        associatedCollection,
        isBookmarked,
        toggleBookmark,
        createBookmark,
        removeBookmark,
        isOpen,
        setIsOpen,
    };
}
