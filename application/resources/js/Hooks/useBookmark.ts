import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {Ziggy} from "@/ziggy";

interface UseBookmarkProps {
    modelType: string;
    itemId: number;
}

export default function useBookmark({ modelType, itemId }: UseBookmarkProps) {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [bookmarkId, setBookmarkId] = useState<number | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchBookmarkStatus();
    }, [modelType, itemId]);
    const fetchBookmarkStatus = async () => {
        try {
            const response = await axios.get(
                route('api.bookmarks.status', { modelType, modelId: itemId }),
            );
            setIsBookmarked(response.data.isBookmarked);
            setBookmarkId(response.data.id || null);
        } catch (error) {
            console.error('Error fetching bookmark status', error);
        }
    };

    const createBookmark = async () => {
        try {
            const response = await axios.post(
                route('api.bookmarks.store', { modelType, modelId: itemId }),
            );
            if (response.data.bookmarkItem) {
                setIsBookmarked(true);
                setBookmarkId(response.data.bookmarkItem.id);
                setIsOpen(true);
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
                await axios.delete(
                    route('api.bookmarks.remove', {
                        id: bookmarkId,
                    }),
                );
                setIsBookmarked(false);
                setIsOpen(false);
                toast.success('Bookmark removed successfully!', {
                    className: 'bg-gray-800 text-white',
                    toastId: 'bookmark-remove-error',
                });
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
        isBookmarked,
        toggleBookmark,
        createBookmark,
        removeBookmark,
        isOpen,
        setIsOpen,
    };
}
