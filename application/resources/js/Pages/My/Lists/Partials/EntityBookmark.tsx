import BookmarkOffIcon from '@/Components/svgs/BookmarkOffIcon';
import BookmarkOnIcon from '@/Components/svgs/BookmarkOnIcon';
import { useList } from '@/Context/ExtendedListContext';
import BookmarkPage1 from '@/Pages/My/Lists/Partials/ListCreateFromBookmarkSave/Step1';
import BookmarkPage2 from '@/Pages/My/Lists/Partials/ListCreateFromBookmarkSave/Step2';
import BookmarkPage3 from '@/Pages/My/Lists/Partials/ListCreateFromBookmarkSave/Step3';
import TransitionMenu from '@/Pages/My/Lists/Partials/TransitionMenu';
import { ReactNode, useState } from 'react';

interface EntityBookmarkProps {
    entityID: number;
    entityToBeBookmarked?: string;
    entityBookmarkCount?: number;
    children?: ReactNode;
}

export default function EntityBookmark({
    children,
    entityToBeBookmarked,
    entityBookmarkCount,
    entityID,
}: EntityBookmarkProps) {
    const { 
        isBookmarked, 
        toggleBookmark, 
        isProcessingBookmark 
    } = useList();
    
    
    const [isOpen, setIsOpen] = useState(false);
    const bookmarked = isBookmarked(entityID);

    const handleOpenChange = async (open: boolean) => {
        if (open && !bookmarked) {
            await toggleBookmark(entityID, entityToBeBookmarked as string);
            setIsOpen(true);
        } else {
            setIsOpen(open);
        }
    };

    const pages = [
        <BookmarkPage1
            key="main"
            isBookmarked={bookmarked}
            isProcessing={isProcessingBookmark}
            handleRemoveBookmark={async () => {
                await toggleBookmark(entityID, entityToBeBookmarked as string);
                setIsOpen(false);
            }}
        />,
        <BookmarkPage2 key="priority" />,
        <BookmarkPage3 key="new-list" />,
    ];

    return (
        <TransitionMenu
            trigger={
                children ? (
                    children
                ) : (
                    <button
                        className="rounded-full p-1.5"
                        aria-label={`bookmark-${entityToBeBookmarked}`}
                        disabled={isProcessingBookmark}
                    >
                        {bookmarked ? (
                            <BookmarkOnIcon count={entityBookmarkCount} />
                        ) : (
                            <BookmarkOffIcon />
                        )}
                    </button>
                )
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
