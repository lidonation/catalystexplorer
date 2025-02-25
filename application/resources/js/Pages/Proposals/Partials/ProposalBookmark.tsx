import BookmarkOffIcon from '@/Components/svgs/BookmarkOffIcon';
import BookmarkOnIcon from '@/Components/svgs/BookmarkOnIcon';
import BookmarkPage1 from '@/Pages/My/Lists/Partials/ListCreateFromBookmarkSave/Step1';
import BookmarkPage2 from '@/Pages/My/Lists/Partials/ListCreateFromBookmarkSave/Step2';
import BookmarkPage3 from '@/Pages/My/Lists/Partials/ListCreateFromBookmarkSave/Step3';
import TransitionMenu from '@/Pages/My/Lists/Partials/TransitionMenu';
import { useState } from 'react';

export default function ProposalBookmark() {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const pages = [
        <BookmarkPage1
            key="main"
            isBookmarked={isBookmarked}
            handleRemoveBookmark={() => {
                setIsBookmarked(false);
                setIsOpen(false);
            }}
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
