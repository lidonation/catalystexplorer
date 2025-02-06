import BookmarkOffIcon from '@/Components/svgs/BookmarkOffIcon';
import BookmarkOnIcon from '@/Components/svgs/BookmarkOnIcon';
import BookmarkPage1 from '@/Pages/My/Lists/Partials/ListCreateFromBookmarkSave/Step1';
import BookmarkPage2 from '@/Pages/My/Lists/Partials/ListCreateFromBookmarkSave/Step2';
import BookmarkPage3 from '@/Pages/My/Lists/Partials/ListCreateFromBookmarkSave/Step3';
import TransitionMenu from '@/Pages/My/Lists/Partials/TransitionMenu';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function ProposalBookmark({
    proposalId,
}: {
    proposalId?: number;
}) {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [bookmarkId, setBookmarkId] = useState<number | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchBookmarkStatus = async () => {
            try {
                const response = await axios.get(
                    `/en/my/bookmarks/${proposalId}/status`,
                );
                setIsBookmarked(response.data.isBookmarked);
                setBookmarkId(response.data.id || null);
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    setIsBookmarked(false);
                } else {
                    console.log('Error fetching bookmark status', error);
                }
            }
        };
        if (proposalId) {
            fetchBookmarkStatus();
        }
    }, [proposalId]);

    const createBookmark = async () => {
        if (!proposalId) {
            console.error('proposalId is undefined or null');
            return;
        }
        try {
            console.log('Bookmark button clicked, isBookmarked:', isBookmarked);
            const response = await axios.post(`/en/my/bookmarks/${proposalId}/bookmark`);
            console.log('response : ', response.data);
            if (response.data.bookmarkItem) {
                setIsBookmarked(true);
                setBookmarkId(response.data.bookmarkItem.id);
                setIsOpen(true);
            }
        } catch (error) {
            console.error('Error creating bookmark: ', error);
        }
    };
    const removeBookmark = async () => {
        try {
            await axios.delete(`/en/my/bookmarks/${bookmarkId}`);
            setIsBookmarked(false);
            setIsOpen(false);
        } catch (error) {
            console.error('Error removing bookmark: ', error);
        }
    };
    const handleBookmarkClick = async (event) => {
        event.stopPropagation();
        console.log('Bookmark button clicked');
        if (isBookmarked) {
            await removeBookmark();
        } else {
            // console.log('Creating bookmark...');
            await createBookmark();
        }
    };
    const pages = [
        <BookmarkPage1
            key="main"
            isBookmarked={isBookmarked}
            handleRemoveBookmark={removeBookmark}
        />,
        <BookmarkPage2 key="priority" />,
        <BookmarkPage3 key="new-list" />,
    ];

    const handleOpenChange = (open: boolean) => {
        if (open && !isBookmarked) {
            setIsBookmarked(true);
            setIsOpen(true);
        } else {
            setIsOpen(open);
        }
    };

    return (
        <TransitionMenu
            trigger={
                <button
                    className="rounded-full p-1.5"
                    aria-label="bookmark-proposal"
                    onClick={handleBookmarkClick}

                    // onClick={(event) => {
                        // event.stopPropagation();
                        // console.log('Button clicked');
                        // handleBookmarkClick();}
                    // }
                >
                    {isBookmarked ? <BookmarkOnIcon /> : <BookmarkOffIcon />}
                </button>
            }
            pages={pages}
            side="left"
            align="start"
            alignOffset={40}
            width="240px"
            open={isOpen}
            onOpenChange={handleOpenChange}
        />
    );
}
