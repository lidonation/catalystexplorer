import BookmarkOffIcon from '@/Components/svgs/BookmarkOffIcon';
import BookmarkOnIcon from '@/Components/svgs/BookmarkOnIcon';
import ToolTipHover from '@/Components/ToolTipHover';
import useBookmark from '@/useHooks/useBookmark';
import BookmarkPage1 from '@/Pages/My/Lists/Partials/ListCreateFromBookmarkSave/Step1';
import BookmarkPage2 from '@/Pages/My/Lists/Partials/ListCreateFromBookmarkSave/Step2';
import BookmarkPage3 from '@/Pages/My/Lists/Partials/ListCreateFromBookmarkSave/Step3';
import TransitionMenu from '@/Pages/My/Lists/Partials/TransitionMenu';
import { useRef, useState } from 'react';

interface BookmarkButtonProps {
    modelType: string;
    itemId: string;
    width?: number;
    height?: number;
    children?: React.ReactNode;
    dataTestId?: string;
    buttonTheme?: string;
}

export default function BookmarkButton({
    modelType,
    itemId,
    width = 24,
    height = 24,
    children,
    dataTestId = 'bookmark-button',
    buttonTheme = 'text-white',
}: BookmarkButtonProps) {
    const {
        isBookmarked,
        toggleBookmark,
        createBookmark,
        removeBookmark,
        isOpen,
        setIsOpen,
        bookmarkId,
        associatedCollection,
    } = useBookmark({ modelType, itemId });

    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleOpenChange = async (open: boolean) => {
        setIsOpen(open);
        if (open && !isBookmarked) {
            await createBookmark();
        } else {
            setIsOpen(open);
        }
        if (!open && buttonRef.current) {
            buttonRef.current.blur();
        }
    };
    const handleClose = () => {
        handleOpenChange(false);
    };
    const [isHovered, setIsHovered] = useState(false);

    const pages = [
        <BookmarkPage1
            key="main"
            bookmarkId={bookmarkId as string}
            isBookmarked={isBookmarked}
            handleRemoveBookmark={removeBookmark}
            associateCollectionId={associatedCollection as string}
            onClose={handleClose}
        />,
        <BookmarkPage2 key="priority" />,
        <BookmarkPage3 key="new-list" />,
    ];

    return (
        <TransitionMenu
            trigger={
                <button
                    className={`relative inline-flex cursor-pointer gap-1 rounded-full px-0 py-0.5 ${isBookmarked ? 'text-success' : buttonTheme}`}
                    aria-label={`bookmark-${modelType}`}
                    onPointerDown={(e) => {
                        e.stopPropagation(); // optional
                        toggleBookmark();
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    data-testid={dataTestId}
                    style={{
                        outline: 'none', // Remove focus outline
                        WebkitTapHighlightColor: 'transparent', // Remove tap highlight on mobile
                    }}
                >
                    {children}
                    {isHovered && (
                        <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 transform">
                            <ToolTipHover props={'Bookmark Item'} />
                        </div>
                    )}
                    {isBookmarked ? (
                        <BookmarkOnIcon width={width} height={height} />
                    ) : (
                        <BookmarkOffIcon className={buttonTheme} width={width} height={height} />
                    )}
                </button>
            }
            pages={pages}
            side="right"
            align="start"
            alignOffset={40}
            width="240px"
            open={isOpen}
            onOpenChange={handleOpenChange}
            data-testid="bookmark-popup"
        />
    );
}
