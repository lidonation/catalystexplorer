import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

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
                `/en/my/bookmarks/${modelType}/${itemId}/status`,
            );
            setIsBookmarked(response.data.isBookmarked);
            setBookmarkId(response.data.id || null);
        } catch (error: any) {
            if (error.response?.status === 400) {
                console.error('Invalid model type:', modelType);
            } else if (error.response?.status === 404) {
                setIsBookmarked(false);
            } else {
                console.error('Error fetching bookmark status', error);
            }
        }
    };

    const createBookmark = async () => {
        try {
            const response = await axios.post(
                `/en/my/bookmarks/${modelType}/${itemId}`,
            );
            if (response.data.bookmarkItem) {
                setIsBookmarked(true);
                setBookmarkId(response.data.bookmarkItem.id);
                setIsOpen(true);
                toast.success('Bookmark created successfully!', {
                    className:
                        'toastify-toast toastify-toast--success rounded-full px-2 py-1 text-xs',
                });
            }
        } catch (error) {
            console.error('Error creating bookmark:', error);
        }
    };

    const removeBookmark = async () => {
        try {
            if (bookmarkId) {
                await axios.delete(`/en/my/bookmarks/${bookmarkId}`);
                setIsBookmarked(false);
                setIsOpen(false);
                toast.success('Bookmark removed successfully!', {
                    className:
                        'toastify-toast toastify-toast--success rounded-full px-2 py-1 text-xs',
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
