import BookmarkOffIcon from '@/Components/svgs/BookmarkOffIcon';
import BookmarkOnIcon from '@/Components/svgs/BookmarkOnIcon';
import useBookmark from '@/Hooks/useBookmark';
import BookmarkPage1 from '@/Pages/My/Lists/Partials/ListCreateFromBookmarkSave/Step1';
import BookmarkPage2 from '@/Pages/My/Lists/Partials/ListCreateFromBookmarkSave/Step2';
import BookmarkPage3 from '@/Pages/My/Lists/Partials/ListCreateFromBookmarkSave/Step3';
import TransitionMenu from '@/Pages/My/Lists/Partials/TransitionMenu';

interface BookmarkButtonProps {
    modelType: string;
    itemId: string;
    width?: number;
    height?: number;
}

export default function BookmarkButton({
    modelType,
    itemId,
    width = 24,
    height = 24,
}: BookmarkButtonProps) {
    const {
        isBookmarked,
        toggleBookmark,
        createBookmark,
        removeBookmark,
        isOpen,
        setIsOpen,
        bookmarkId,
        associatedCollection
    } = useBookmark({ modelType, itemId });   
    const handleOpenChange = async (open: boolean) => {
        if (open && !isBookmarked) {
            await createBookmark();
        } else {
            setIsOpen(open);
        }
    };

    const pages = [
        <BookmarkPage1
            key="main"
            bookmarkId={bookmarkId as string}
            isBookmarked={isBookmarked}
            handleRemoveBookmark={removeBookmark}
            associateCollectionId={associatedCollection as string}
        />,
        <BookmarkPage2 key="priority" />,
        <BookmarkPage3 key="new-list" />,
    ];    

    return (
        <TransitionMenu
            trigger={
                <button
                    className="cursor-pointer rounded-full p-1.5"
                    aria-label={`bookmark-${modelType}`}
                    onClick={toggleBookmark}
                >
                    {isBookmarked ? <BookmarkOnIcon width={width} height={height} /> : <BookmarkOffIcon width={width} height={height} />}
                </button>
            }
            pages={pages}
            side="right"
            align="start"
            alignOffset={40}
            width="240px"
            open={isOpen}
            onOpenChange={handleOpenChange}
        />
    );
}
